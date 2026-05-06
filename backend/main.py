from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import os
import fitz
from fastapi.security import OAuth2PasswordBearer


from models import (
    InterviewSession,
    AnswerSubmit,
    AnswerResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
)
from database import interviews_collection, users_collection, question_bank_collection
import ai_service
import auth
from datetime import datetime, timezone
from fastapi import status


# Removed optional_oauth2_scheme as login is now mandatory.



app = FastAPI(title="Kannada AI Interview API")

# Setup CORS
# Allow both default port 3000 and the fallback 3001 often used when 3000 is busy
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(new_user)

    access_token_expires = auth.timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": str(result.inserted_id)},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not auth.verify_password(
        user_data.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = auth.timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = auth.create_access_token(
        data={"sub": user["email"], "user_id": str(user["_id"])},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(token: str = Depends(auth.oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(
            token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM]
        )
        user_id: str | None = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except auth.jwt.PyJWTError:
        raise credentials_exception

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    user["_id"] = str(user["_id"])
    return user


@app.put("/api/auth/me", response_model=UserResponse)
async def update_users_me(
    user_update: UserUpdate, user: dict = Depends(read_users_me)
):
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return user

    await users_collection.update_one(
        {"_id": ObjectId(user["_id"])}, {"$set": update_data}
    )

    updated_user = await users_collection.find_one({"_id": ObjectId(user["_id"])})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])
        return updated_user
    return user


@app.post("/api/profile/resume", response_model=UserResponse)
async def upload_resume_for_ats(
    resume: UploadFile = File(...), user: dict = Depends(read_users_me)
):
    # Case-insensitive extension check
    filename = resume.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    print(f"DEBUG: Processing PDF: {filename}")
    try:
        content = await resume.read()
        if not content:
            raise HTTPException(status_code=400, detail="The uploaded PDF is empty")
            
        print(f"DEBUG: PDF content size: {len(content)} bytes")
        
        # Use a more robust way to open the PDF stream
        import io
        doc = fitz.open(stream=io.BytesIO(content), filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        resume_text = text.strip()
        print(f"DEBUG: Extracted text length: {len(resume_text)}")
    except Exception as e:
        print(f"ERROR during PDF extraction: {e}")
        raise HTTPException(status_code=400, detail=f"Could not extract text from the PDF: {str(e)}")

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF. Please upload a text-based PDF.")

    # Evaluate ATS score
    try:
        ats_result = await ai_service.evaluate_resume_ats(resume_text)
    except ValueError as e:
        error_msg = str(e)
        if "quota" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(
                status_code=429,
                detail=error_msg,
            )
        raise HTTPException(status_code=500, detail=error_msg)

    update_data = {
        "resume_text": resume_text,
        "ats_score": ats_result.get("ats_score"),
        "ats_feedback": ats_result.get("ats_feedback"),
    }

    await users_collection.update_one(
        {"_id": ObjectId(user["_id"])}, {"$set": update_data}
    )

    updated_user = await users_collection.find_one({"_id": ObjectId(user["_id"])})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])
        return updated_user
    return user


def require_admin(user: dict = Depends(read_users_me)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user


@app.get("/api/admin/users")
async def get_all_users(admin_user: dict = Depends(require_admin)):
    cursor = users_collection.find({}, {"hashed_password": 0}).sort(
        "created_at", -1
    )
    users = await cursor.to_list(length=1000)
    for u in users:
        u["_id"] = str(u["_id"])
    return users


@app.get("/api/admin/interviews")
async def get_all_interviews(admin_user: dict = Depends(require_admin)):
    cursor = interviews_collection.find({}).sort("created_at", -1)
    interviews = await cursor.to_list(length=1000)
    for i in interviews:
        i["_id"] = str(i["_id"])
    return interviews


@app.get("/api/admin/question-bank")
async def get_question_bank(
    role: str | None = None,
    difficulty: str | None = None,
    category: str | None = None,
    admin_user: dict = Depends(require_admin),
):
    """Return training Q&A pairs, optionally filtered by role/difficulty/category."""
    query: dict = {}
    if role:
        query["role"] = {"$regex": role, "$options": "i"}
    if difficulty:
        query["difficulty"] = difficulty.lower()
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    cursor = question_bank_collection.find(query, {"_id": 0})
    items = await cursor.to_list(length=1000)
    return {"total": len(items), "questions": items}


@app.get("/api/question-bank/roles")
async def get_available_roles(user: dict = Depends(read_users_me)):
    """Return distinct roles available in the question bank."""
    roles = await question_bank_collection.distinct("role")
    return {"roles": sorted(roles)}


@app.post("/api/interview/start", response_model=InterviewSession)
async def start_interview(
    job_role: str = Form(...),
    difficulty: str = Form("medium"),
    resume: UploadFile = File(None),
    user: dict = Depends(read_users_me),
):
    user_id = user["_id"]


    resume_text = None
    if resume and resume.filename and resume.filename.lower().endswith(".pdf"):
        try:
            content = await resume.read()
            if content:
                import io
                doc = fitz.open(stream=io.BytesIO(content), filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                resume_text = text.strip()
                print(f"DEBUG: Interview resume extracted: {len(resume_text)} chars")
        except Exception as e:
            print(f"ERROR extracting resume during interview start: {e}")
            # We don't raise here to allow interview to start without resume if parsing fails

    # Fallback to profile resume if none provided in the request
    if not resume_text and user.get("resume_text"):
        resume_text = user.get("resume_text")
        print(f"DEBUG: Using stored resume text from profile ({len(resume_text)} chars)")

    # 1. Generate the first question in Kannada
    first_question = await ai_service.generate_first_question(
        job_role, difficulty, resume_text
    )

    # 2. Create session in DB
    new_session = {
        "job_role": job_role,
        "difficulty": difficulty,
        "resume_text": resume_text,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
        "messages": [
            {
                "role": "ai",
                "content": first_question,
                "timestamp": datetime.now(timezone.utc),
            }
        ],
        "status": "active",
    }

    result = await interviews_collection.insert_one(new_session)
    new_session["_id"] = str(result.inserted_id)

    return new_session


@app.get("/api/interview/{session_id}", response_model=InterviewSession)
async def get_interview(session_id: str, user: dict = Depends(read_users_me)):
    session = await interviews_collection.find_one(
        {"_id": ObjectId(session_id)}
    )
    if not session:
        raise HTTPException(
            status_code=404, detail="Interview session not found"
        )

    # Ownership check: User must be owner or admin
    if session.get("user_id") != user["_id"] and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session",
        )

    session["_id"] = str(session["_id"])
    return session



@app.post("/api/interview/answer", response_model=AnswerResponse)
async def submit_answer(data: AnswerSubmit, user: dict = Depends(read_users_me)):
    session = await interviews_collection.find_one(
        {"_id": ObjectId(data.session_id)}
    )
    if not session:
        raise HTTPException(
            status_code=404, detail="Interview session not found"
        )

    if session.get("status") == "completed":
        raise HTTPException(
            status_code=400, detail="Interview already completed"
        )

    # Ownership check
    if session.get("user_id") != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to interact with this session",
        )


    # Save user answer
    user_msg = {
        "role": "user",
        "content": data.answer,
        "timestamp": datetime.now(timezone.utc),
    }
    session["messages"].append(user_msg)

    # Evaluate and get next question
    ai_response = await ai_service.evaluate_answer_and_get_next(
        session["job_role"],
        session["messages"][
            :-1
        ],  # Pass previous messages without the current answer
        data.answer,
    )

    if ai_response.get("feedback"):
        session["messages"].append(
            {
                "role": "ai",
                "content": ai_response["feedback"],
                "timestamp": datetime.now(timezone.utc),
            }
        )

    if ai_response.get("is_completed") or not ai_response.get("next_question"):
        # Complete the interview
        session["status"] = "completed"

        # Calculate final results
        final_results = await ai_service.generate_final_results(
            session["job_role"], session["messages"]
        )
        session["feedback"] = final_results.get("overall_feedback")
        session["score"] = final_results.get("score")
    else:
        # Save next question
        ai_msg = {
            "role": "ai",
            "content": ai_response["next_question"],
            "timestamp": datetime.now(timezone.utc),
        }
        session["messages"].append(ai_msg)

    # Update DB
    await interviews_collection.update_one(
        {"_id": ObjectId(data.session_id)},
        {
            "$set": {
                "messages": session["messages"],
                "status": session.get("status", "active"),
                "feedback": session.get("feedback"),
                "score": session.get("score"),
            }
        },
    )

    return AnswerResponse(
        feedback=ai_response.get("feedback", ""),
        next_question=ai_response.get("next_question"),
        is_completed=session.get("status") == "completed",
        transcribed_text=data.answer,
    )


@app.post("/api/interview/audio-answer", response_model=AnswerResponse)
async def submit_audio_answer(
    session_id: str = Form(...), 
    audio: UploadFile = File(...),
    user: dict = Depends(read_users_me)
):
    content = await audio.read()
    mime_type = audio.content_type

    # 1. Transcribe the audio
    transcription = await ai_service.transcribe_audio(content, mime_type)

    # 2. Reuse the submit_answer logic (which now includes user)
    data = AnswerSubmit(session_id=session_id, answer=transcription)
    return await submit_answer(data, user)


@app.post("/api/interview/{session_id}/stop", response_model=InterviewSession)
async def stop_interview(session_id: str, user: dict = Depends(read_users_me)):
    session = await interviews_collection.find_one(
        {"_id": ObjectId(session_id)}
    )
    if not session:
        raise HTTPException(
            status_code=404, detail="Interview session not found"
        )

    if session.get("status") == "completed":
        raise HTTPException(
            status_code=400, detail="Interview already completed"
        )

    # Ownership check
    if session.get("user_id") != user["_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to stop this session",
        )

    # Complete the interview
    session["status"] = "completed"

    # Calculate final results
    final_results = await ai_service.generate_final_results(
        session["job_role"], session["messages"]
    )
    session["feedback"] = final_results.get("overall_feedback")
    session["score"] = final_results.get("score")

    # Update DB
    await interviews_collection.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "completed",
                "feedback": session.get("feedback"),
                "score": session.get("score"),
            }
        },
    )

    session["_id"] = str(session["_id"])
    return session

@app.delete("/api/interview/{session_id}")
async def delete_interview(session_id: str, user: dict = Depends(read_users_me)):
    session = await interviews_collection.find_one(
        {"_id": ObjectId(session_id)}
    )
    if not session:
        raise HTTPException(
            status_code=404, detail="Interview session not found"
        )

    # Ownership check
    if session.get("user_id") != user["_id"] and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this session",
        )

    await interviews_collection.delete_one({"_id": ObjectId(session_id)})
    return {"message": "Session deleted successfully"}


@app.get("/api/interview/{session_id}/report")
async def get_interview_report(session_id: str, user: dict = Depends(read_users_me)):
    session = await interviews_collection.find_one({"_id": ObjectId(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    # Ownership check
    if session.get("user_id") != user["_id"] and user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session",
        )

    if session.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Interview is not yet completed")

    # Generate the detailed report
    report = await ai_service.generate_interview_report(
        job_role=session["job_role"],
        messages=session["messages"],
        overall_feedback=session.get("feedback", ""),
        score=session.get("score", 0),
    )

    return {
        "session_id": session_id,
        "job_role": session["job_role"],
        "score": session.get("score", 0),
        "overall_feedback": session.get("feedback", ""),
        "created_at": session.get("created_at"),
        "candidate_name": user.get("name", "Candidate"),
        **report,
    }
