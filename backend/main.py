from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from bson import ObjectId
import os
import asyncio
import fitz
import csv
import io
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

import models
import ai_service
import auth
from database import (
    interviews_collection, 
    users_collection, 
    question_bank_collection,
    jobs_collection,
    candidates_collection
)
import messaging_service


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


@app.post("/api/auth/register", response_model=models.Token)
async def register(user: models.UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "role": user.role or "user",
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


@app.post("/api/auth/login", response_model=models.Token)
async def login(user_data: models.UserLogin):
    user = await users_collection.find_one({"email": user_data.email})
    if not user or not auth.verify_password(
        user_data.password, user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Automatically elevate admin@admin.com for testing/management
    if user["email"] == "admin@admin.com" and user.get("role") != "admin":
        await users_collection.update_one(
            {"_id": user["_id"]}, {"$set": {"role": "admin"}}
        )
        user["role"] = "admin"

    access_token_expires = auth.timedelta(
        minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = auth.create_access_token(
        data={"sub": user["email"], "user_id": str(user["_id"])},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=models.UserResponse)
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


@app.put("/api/auth/me", response_model=models.UserResponse)
async def update_user_me(
    user_update: models.UserUpdate, 
    user: dict = Depends(read_users_me)
):
    update_data = user_update.model_dump(exclude_unset=True)
    
    # If skills or experience changed, we can trigger an AI resume generation if resume_text is not provided
    if ("skills" in update_data or "experience" in update_data) and "resume_text" not in update_data:
        # Simple AI resume generation logic
        skills_str = ", ".join(update_data.get("skills", user.get("skills", [])))
        exp_str = update_data.get("experience", user.get("experience", "No experience listed"))
        location_str = update_data.get("location", user.get("location", "Unknown"))
        
        prompt = f"Create a professional blue-collar resume summary for {user['name']} based in {location_str}. Skills: {skills_str}. Experience: {exp_str}. Keep it concise and formatted for an AI interviewer."
        try:
            generated_resume = await ai_service.generate_resume_from_profile(prompt)
            update_data["resume_text"] = generated_resume
        except:
            pass

    await users_collection.update_one(
        {"_id": ObjectId(user["id"])}, 
        {"$set": update_data}
    )
    
    # Fetch updated user
    updated_user = await users_collection.find_one({"_id": ObjectId(user["id"])})
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user


@app.post("/api/auth/generate-resume")
async def generate_user_resume(user: dict = Depends(read_users_me)):
    skills_str = ", ".join(user.get("skills", []))
    exp_str = user.get("experience", "No experience listed")
    location_str = user.get("location", "Unknown")
    
    prompt = f"Create a professional blue-collar resume for {user['name']} based in {location_str}. Skills: {skills_str}. Experience: {exp_str}. Format it cleanly with sections for Profile, Skills, and Experience. Keep it suitable for printing or sharing with recruiters."
    
    try:
        generated_resume = await ai_service.generate_resume_from_profile(prompt)
        await users_collection.update_one(
            {"_id": ObjectId(user["id"])}, 
            {"$set": {"resume_text": generated_resume}}
        )
        return {"resume_text": generated_resume}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...), 
    user: dict = Depends(read_users_me)
):
    # Ensure it's an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # In a real app, we would save the file to S3/Cloudinary. 
    # For this demo, we'll convert to base64 to store in DB directly (small images only)
    try:
        content = await file.read()
        import base64
        base64_image = base64.b64encode(content).decode("utf-8")
        data_url = f"data:{file.content_type};base64,{base64_image}"
        
        await users_collection.update_one(
            {"_id": ObjectId(user["id"])}, 
            {"$set": {"profile_picture": data_url}}
        )
        return {"profile_picture": data_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/stats")
async def get_admin_stats(user: dict = Depends(read_users_me)):
    if user.role not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    total_jobs = await jobs_collection.count_documents({})
    total_candidates = await candidates_collection.count_documents({})
    total_interviews = await interviews_collection.count_documents({})
    
    # Calculate AI Screened percentage
    ai_screened = await candidates_collection.count_documents({"evaluation_result": {"$exists": True, "$ne": None}})
    ai_screened_pct = (ai_screened / total_candidates * 100) if total_candidates > 0 else 0
    
    return {
        "total_jobs": total_jobs,
        "total_applicants": total_candidates,
        "total_interviews": total_interviews,
        "ai_screened_pct": round(ai_screened_pct, 1)
    }


@app.get("/api/admin/all-candidates")
async def get_all_candidates_admin(user: dict = Depends(read_users_me)):
    if user.role not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cursor = candidates_collection.find({}).sort("created_at", -1)
    candidates = await cursor.to_list(length=1000)
    
    # Enrich with job title
    for c in candidates:
        c["_id"] = str(c["_id"])
        job = await jobs_collection.find_one({"_id": ObjectId(c["job_id"])})
        c["job_title"] = job.get("title", "Unknown Job") if job else "Deleted Job"
        
        # Check for interview session
        session = await interviews_collection.find_one({"candidate_id": c["_id"]})
        if session:
            c["session_id"] = str(session["_id"])
            c["status"] = session.get("status", "Pending")
            c["ai_score"] = session.get("score")
        else:
            c["status"] = c.get("status", "Pending")
            
    return candidates


@app.get("/api/admin/analytics")
async def get_admin_analytics(user: dict = Depends(read_users_me)):
    if user.role not in ["admin", "recruiter"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # 1. Conversion Metrics
    total_applications = await candidates_collection.count_documents({})
    
    interviews_cursor = interviews_collection.find({"is_practice": {"$ne": True}})
    interviews = await interviews_cursor.to_list(length=5000)
    
    total_interviews = len(interviews)
    completed_interviews = sum(1 for i in interviews if i.get("status") == "completed")
    
    selected_candidates = await candidates_collection.count_documents({"selection_status": "Selected"})
    
    # 2. Performance Metrics
    scores = [i.get("score") for i in interviews if i.get("score") is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    highest_score = max(scores) if scores else 0
    lowest_score = min(scores) if scores else 0
    
    # 3. Score Distribution
    distribution = {
        "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0
    }
    for s in scores:
        if s <= 20: distribution["0-20"] += 1
        elif s <= 40: distribution["21-40"] += 1
        elif s <= 60: distribution["41-60"] += 1
        elif s <= 80: distribution["61-80"] += 1
        else: distribution["81-100"] += 1

    return {
        "funnel": {
            "applications": total_applications,
            "interviews_started": total_interviews,
            "interviews_completed": completed_interviews,
            "shortlisted": selected_candidates
        },
        "performance": {
            "avg_score": round(avg_score, 1),
            "highest_score": highest_score,
            "lowest_score": lowest_score,
            "total_scored": len(scores)
        },
        "distribution": distribution
    }


async def get_current_user_optional(token: str = Depends(auth.oauth2_scheme_optional)):
    if not token:
        return None
    try:
        payload = auth.jwt.decode(
            token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM]
        )
        user_id: str | None = payload.get("user_id")
        if user_id is None:
            return None
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])
            return user
    except:
        return None
    return None


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


@app.post("/api/interview/start", response_model=models.InterviewSession, response_model_by_alias=True)
async def start_interview(
    job_role: str = Form(...),
    difficulty: str = Form("medium"),
    resume: UploadFile = File(None),
    job_id: str = Form(None),
    candidate_id: str = Form(None),
    is_practice: bool = Form(False),
    user: Optional[dict] = Depends(get_current_user_optional),
):
    # Authentication check: if not a candidate, must be logged in
    if not candidate_id and not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to start an interview",
        )
    
    user_id = user["_id"] if user else None

    # If job_id is provided, override job_role with actual job title
    if job_id:
        try:
            job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
            if job:
                job_role = job.get("title", job_role)
                print(f"DEBUG: Interview started for Job: {job_role}")
        except Exception as e:
            print(f"ERROR: Could not fetch job title: {e}")


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
        "job_id": job_id,
        "candidate_id": candidate_id,
        "is_practice": is_practice,
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
    session_id = str(result.inserted_id)
    new_session["_id"] = session_id

    # Link session to candidate if provided
    if candidate_id:
        try:
            await candidates_collection.update_one(
                {"_id": ObjectId(candidate_id)},
                {"$set": {"session_id": session_id, "status": "In Progress"}}
            )
            print(f"DEBUG: Linked session {session_id} to candidate {candidate_id}")
        except Exception as e:
            print(f"ERROR linking session to candidate: {e}")

    return new_session


@app.get("/api/interview/{session_id}", response_model=models.InterviewSession, response_model_by_alias=True)
async def get_interview(session_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
    session = await interviews_collection.find_one(
        {"_id": ObjectId(session_id)}
    )
    if not session:
        raise HTTPException(
            status_code=404, detail="Interview session not found"
        )

    # Ownership check: User must be owner, or it must be a candidate session, or user is admin
    is_owner = user and session.get("user_id") == user["_id"]
    is_admin = user and user.get("role") == "admin"
    is_candidate_session = session.get("candidate_id") is not None
    
    if not is_owner and not is_admin and not is_candidate_session:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this session",
        )

    session["_id"] = str(session["_id"])
    
    # Restrict results: if it's a hiring interview, only admins see results
    if session.get("job_id") and user.get("role") != "admin":
        session.pop("score", None)
        session.pop("feedback", None)
        
    return session



@app.post("/api/interview/answer", response_model=models.AnswerResponse)
async def submit_answer(data: models.AnswerSubmit, user: Optional[dict] = Depends(get_current_user_optional)):
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
    is_owner = user and session.get("user_id") == user["_id"]
    is_admin = user and user.get("role") == "admin"
    is_candidate_session = session.get("candidate_id") is not None

    if not is_owner and not is_admin and not is_candidate_session:
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

    return models.AnswerResponse(
        feedback=ai_response.get("feedback", ""),
        next_question=ai_response.get("next_question"),
        is_completed=session.get("status") == "completed",
        transcribed_text=data.answer,
    )


@app.post("/api/interview/audio-answer", response_model=models.AnswerResponse)
async def submit_audio_answer(
    session_id: str = Form(...), 
    audio: UploadFile = File(...),
    user: Optional[dict] = Depends(get_current_user_optional)
):
    content = await audio.read()
    mime_type = audio.content_type

    # 1. Transcribe the audio
    transcription = await ai_service.transcribe_audio(content, mime_type)

    # 2. Reuse the submit_answer logic (which now includes user)
    data = models.AnswerSubmit(session_id=session_id, answer=transcription)
    return await submit_answer(data, user)


@app.post("/api/interview/{session_id}/stop", response_model=models.InterviewSession, response_model_by_alias=True)
async def stop_interview(session_id: str, user: Optional[dict] = Depends(get_current_user_optional)):
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
    is_owner = user and session.get("user_id") == user["_id"]
    is_admin = user and user.get("role") == "admin"
    is_candidate_session = session.get("candidate_id") is not None

    if not is_owner and not is_admin and not is_candidate_session:
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

    # Hiring interview restriction: only admins see reports
    if session.get("job_id") and user.get("role") != "admin":
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate results are restricted to the hiring team",
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

@app.post("/api/admin/generate-job-info")
async def api_generate_job_info(
    data: dict, admin_user: dict = Depends(require_admin)
):
    title = data.get("title")
    location = data.get("location")
    if not title or not location:
        raise HTTPException(status_code=400, detail="Title and Location are required")
    
    result = await ai_service.generate_job_info(title, location)
    return result

@app.get("/api/admin/analytics/{job_id}")
async def get_job_analytics(job_id: str, admin_user: dict = Depends(require_admin)):
    # 1. Fetch all candidates for this job
    cursor = candidates_collection.find({"job_id": job_id})
    candidates = await cursor.to_list(length=1000)
    
    total = len(candidates)
    if total == 0:
        return {
            "total": 0,
            "selected": 0,
            "rejected": 0,
            "in_progress": 0,
            "avg_score": 0,
            "rejection_reasons": []
        }
        
    selected = sum(1 for c in candidates if c.get("selection_status") == "Selected")
    rejected = sum(1 for c in candidates if c.get("selection_status") == "Rejected")
    
    # 2. Fetch all interview sessions to get scores and real status
    session_cursor = interviews_collection.find({
        "job_id": job_id,
        "is_practice": {"$ne": True}
    })
    sessions = await session_cursor.to_list(length=1000)
    
    scores = [s.get("score") for s in sessions if s.get("score") is not None]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    in_progress = sum(1 for s in sessions if s.get("status") == "active")
    completed = sum(1 for s in sessions if s.get("status") == "completed")
    
    # 3. Aggregate rejection reasons
    reasons = {}
    for c in candidates:
        if c.get("selection_status") == "Rejected":
            reason = c.get("eligibility_reason", "Other")
            # Simple normalization: take first part before "|||"
            short_reason = reason.split("|||")[0].strip()
            reasons[short_reason] = reasons.get(short_reason, 0) + 1
            
    sorted_reasons = sorted(reasons.items(), key=lambda x: x[1], reverse=True)[:3]
    rejection_summary = [{"reason": r, "count": c} for r, c in sorted_reasons]
    
    return {
        "total": total,
        "selected": selected,
        "rejected": rejected,
        "in_progress": in_progress,
        "completed": completed,
        "avg_score": round(avg_score, 1),
        "rejection_reasons": rejection_summary
    }

# Hiring Endpoints
@app.post("/api/jobs", response_model=models.Job, response_model_by_alias=True)
async def create_job(job: models.JobCreate, admin_user: dict = Depends(require_admin)):
    job_data = job.model_dump()
    job_data["created_at"] = datetime.now(timezone.utc)
    job_data["is_active"] = True
    job_data["recruiter_id"] = str(admin_user["_id"])
    
    result = await jobs_collection.insert_one(job_data)
    job_data["_id"] = str(result.inserted_id)
    return job_data

@app.get("/api/jobs")
async def get_jobs():
    cursor = jobs_collection.find({}).sort("created_at", -1)
    jobs = await cursor.to_list(length=100)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str, admin_user: dict = Depends(require_admin)):
    # 1. Delete associated candidates
    await candidates_collection.delete_many({"job_id": job_id})
    # 2. Delete associated interviews
    await interviews_collection.delete_many({"job_id": job_id})
    # 3. Delete the job
    result = await jobs_collection.delete_one({"_id": ObjectId(job_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {"message": "Job and all associated data deleted successfully"}

@app.get("/api/candidates/{job_id}", response_model=List[models.Candidate], response_model_by_alias=True)
async def get_candidates(job_id: str):
    cursor = candidates_collection.find({"job_id": job_id}).sort("created_at", -1)
    candidates = await cursor.to_list(length=100)
    for c in candidates:
        c["_id"] = str(c["_id"])
        # Find if there is an interview session for this candidate
        session = await interviews_collection.find_one({"candidate_id": c["_id"]})
        if session:
            c["session_id"] = str(session["_id"])
            c["status"] = session.get("status", "Pending")
            c["ai_score"] = session.get("score")
    return candidates

@app.post("/api/jobs/{job_id}/candidates/csv")
async def upload_candidates_csv(job_id: str, file: UploadFile = File(...), admin_user: dict = Depends(require_admin)):
    # Fetch job to get eligibility criteria
    job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    eligibility_criteria = job.get("eligibility", "General requirements")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    io_string = io.StringIO(decoded)
    reader = csv.DictReader(io_string)
    
    candidate_docs = []
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    
    for row in reader:
        candidate_data = {
            "name": row.get("name", "Unknown"),
            "phone": row.get("phone", ""),
            "email": row.get("email"),
            "experience": row.get("experience"),
            "location": row.get("location"),
            "other_details": row.get("other_details", "")
        }
        
        # Evaluate eligibility using AI
        eval_result = await ai_service.evaluate_candidate_eligibility(eligibility_criteria, candidate_data)
        
        is_eligible = eval_result.get("is_eligible", False)
        selection_status = "Selected" if is_eligible else "Rejected"
        
        # Generate unique interview link
        candidate_id = str(ObjectId())
        interview_link = f"{frontend_url}/interview/start?candidate_id={candidate_id}&job_id={job_id}"
        
        candidate_docs.append({
            "_id": ObjectId(candidate_id),
            **candidate_data,
            "job_id": job_id,
            "status": "Pending",
            "selection_status": selection_status,
            "eligibility_reason": eval_result.get("reason"),
            "interview_link": interview_link if is_eligible else None,
            "created_at": datetime.now(timezone.utc)
        })
    
    if candidate_docs:
        await candidates_collection.insert_many(candidate_docs)
    
    return {"message": f"Processed {len(candidate_docs)} candidates. {sum(1 for c in candidate_docs if c['selection_status'] == 'Selected')} candidates selected."}

@app.post("/api/recruitment/bulk")
async def bulk_recruitment_pipeline(
    title: str = Form(...),
    location: str = Form(...),
    salary: str = Form(...),
    description: str = Form(...),
    requirements: str = Form(...),
    eligibility: str = Form(...),
    notify: str = Form("false"),
    file: UploadFile = File(...),
    admin_user: dict = Depends(require_admin)
):
    try:
        # Convert notify string to bool
        should_notify = notify.lower() == "true"
        
        print(f"DEBUG: [BulkPipeline] Starting for '{title}' (Notify: {should_notify})")
        
        # 1. Create Job record
        job_data = {
            "title": title,
            "location": location,
            "salary": salary,
            "description": description,
            "requirements": requirements,
            "eligibility": eligibility,
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "recruiter_id": str(admin_user["_id"])
        }
        
        try:
            job_result = await jobs_collection.insert_one(job_data)
            job_id = str(job_result.inserted_id)
            print(f"DEBUG: [BulkPipeline] Created Job with ID: {job_id}")
        except Exception as db_err:
            print(f"ERROR: [BulkPipeline] Failed to create job in DB: {db_err}")
            raise HTTPException(status_code=500, detail="Database error during job creation")
        
        # 2. Process CSV
        try:
            content = await file.read()
            if not content:
                raise ValueError("Empty file")
                
            try:
                decoded = content.decode('utf-8')
            except UnicodeDecodeError:
                decoded = content.decode('latin-1')
                
            io_string = io.StringIO(decoded)
            reader = csv.DictReader(io_string)
            rows = [row for row in reader if any(row.values())] # Filter empty rows
            print(f"DEBUG: [BulkPipeline] CSV parsed. Found {len(rows)} candidates.")
        except Exception as e:
            print(f"ERROR: [BulkPipeline] CSV processing failed: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")
        
        if not rows:
            return {
                "job_id": job_id,
                "total_processed": 0,
                "selected_count": 0,
                "notified_count": 0,
                "message": "No candidates found in CSV"
            }
        
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
        
        # Semaphore to limit concurrent AI calls (avoid rate limits)
        sem = asyncio.Semaphore(3)
        
        async def process_candidate(row):
            async with sem:
                # Helper to find column by multiple possible names
                def get_field(names, default=None):
                    for name in names:
                        # Try exact, lowercase, and stripped versions
                        for k in row.keys():
                            if k.lower().strip() == name.lower():
                                return row[k]
                    return default

                # Standard fields with fuzzy mapping
                name = get_field(["name", "full name", "candidate name", "applicant name", "candidate"], "Unknown")
                phone = get_field(["phone", "mobile", "contact", "phone number", "mobile number", "contact number"], "")
                email = get_field(["email", "email address", "mail"], "")
                location = get_field(["location", "city", "address", "current location"], "")
                experience = get_field(["experience", "years of experience", "exp", "work experience"], "")

                # Capture ALL columns into other_details so AI has full context
                all_details = []
                for k, v in row.items():
                    if v:
                        all_details.append(f"{k}: {v}")
                
                candidate_data = {
                    "name": name,
                    "phone": str(phone),
                    "email": email,
                    "experience": experience,
                    "location": location,
                    "other_details": " | ".join(all_details)
                }
                
                try:
                    # Evaluate eligibility using AI
                    eval_result = await ai_service.evaluate_candidate_eligibility(eligibility, candidate_data)
                    is_eligible = eval_result.get("is_eligible", False)
                    selection_status = "Selected" if is_eligible else "Rejected"
                    reason = eval_result.get("reason", "No reason provided")
                except Exception as ai_err:
                    print(f"WARNING: [BulkPipeline] AI evaluation failed for {candidate_data['name']}: {ai_err}")
                    is_eligible = False
                    selection_status = "Error"
                    reason = "Evaluation failed due to AI service error"
                
                candidate_id = str(ObjectId())
                interview_link = f"{frontend_url}/interview/start?candidate_id={candidate_id}&job_id={job_id}"
                
                notified = False
                if is_eligible and should_notify and candidate_data["phone"]:
                    try:
                        await messaging_service.send_interview_link(
                            candidate_data["name"], 
                            candidate_data["phone"], 
                            interview_link
                        )
                        notified = True
                    except Exception as msg_err:
                        print(f"WARNING: [BulkPipeline] Failed to notify {candidate_data['name']}: {msg_err}")
                
                return {
                    "doc": {
                        "_id": ObjectId(candidate_id),
                        **candidate_data,
                        "job_id": job_id,
                        "status": "Pending",
                        "selection_status": selection_status,
                        "eligibility_reason": reason,
                        "interview_link": interview_link if is_eligible else None,
                        "created_at": datetime.now(timezone.utc)
                    },
                    "is_selected": is_eligible,
                    "is_notified": notified
                }

        # Process all candidates
        print(f"DEBUG: [BulkPipeline] Starting AI evaluations for {len(rows)} candidates...")
        results = await asyncio.gather(*[process_candidate(row) for row in rows], return_exceptions=True)
        
        # Filter out exceptions from gather
        valid_results = []
        for res in results:
            if isinstance(res, Exception):
                print(f"ERROR: [BulkPipeline] A candidate task failed completely: {res}")
            else:
                valid_results.append(res)
        
        candidate_docs = [r["doc"] for r in valid_results]
        selected_count = sum(1 for r in valid_results if r["is_selected"])
        notified_count = sum(1 for r in valid_results if r["is_notified"])
        
        if candidate_docs:
            try:
                await candidates_collection.insert_many(candidate_docs)
            except Exception as db_err:
                print(f"ERROR: [BulkPipeline] Failed to insert candidates: {db_err}")
                # We already created the job, so we return what we have but with an error message
                return {
                    "job_id": job_id,
                    "total_processed": 0,
                    "error": "Failed to save candidates to database"
                }
        
        print(f"DEBUG: [BulkPipeline] Completed. Total: {len(candidate_docs)}, Selected: {selected_count}")
        
        return {
            "job_id": job_id,
            "total_processed": len(candidate_docs),
            "selected_count": selected_count,
            "notified_count": notified_count
        }
    except Exception as e:
        print(f"CRITICAL ERROR in bulk_recruitment_pipeline: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")
