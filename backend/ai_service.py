import os
import json
import re
import base64
import asyncio
import random
from openai import AsyncOpenAI
from dotenv import load_dotenv
from training_data import get_questions_for_role

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
is_configured = False
client = None

if API_KEY and API_KEY != "your_api_key_here":
    try:
        # Initialize the OpenRouter client
        client = AsyncOpenAI(
            api_key=API_KEY,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "http://localhost:3000", # Optional, for OpenRouter analytics
                "X-Title": "Kannada AI Interview", # Optional
            }
        )
        is_configured = True
    except Exception as e:
        print(f"Error initializing OpenRouter client: {e}")
        is_configured = False

# Constants for models on OpenRouter
MODEL_NAME = "google/gemini-2.0-flash-001"

QUESTION_SYSTEM_INSTRUCTION = (
    "You are a Technical Interview Question Generator. Your role is to generate "
    "highly specific, adaptive questions in Kannada. You must analyze the "
    "candidate's previous answer and deep-dive into the technical details "
    "they mentioned. After the initial introduction, focus on technical "
    "depth and specific technologies (e.g., React, Python). Keep the "
    "conversation flowing naturally."
)


async def call_ai_with_retry(func, *args, max_retries=3, initial_delay=1, **kwargs):
    """
    Helper to call AI functions with exponential backoff for rate limits.
    """
    if "max_tokens" not in kwargs:
        kwargs["max_tokens"] = 2048
        
    delay = initial_delay
    last_exception = None
    
    for i in range(max_retries):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            last_exception = e
            error_str = str(e).lower()
            # Check for rate limit or quota errors
            if "429" in error_str or "rate limit" in error_str or "quota" in error_str:
                if i < max_retries - 1:
                    # Exponential backoff with jitter
                    sleep_time = delay + random.uniform(0, 1)
                    print(f"Rate limited. Retrying in {sleep_time:.2f}s... (Attempt {i+1}/{max_retries})")
                    await asyncio.sleep(sleep_time)
                    delay *= 2
                    continue
            # If not a rate limit or we're out of retries, raise it
            raise e
    
    if last_exception:
        raise last_exception


async def transcribe_audio(audio_bytes: bytes, mime_type: str | None) -> str:
    if not is_configured or not client:
        return (
            "ಇದು ಆಡಿಯೋ ರೆಕಾರ್ಡಿಂಗ್‌ನ ಅಣಕು ಪಠ್ಯ "
            "(This is a mock text of the audio recording)."
        )

    prompt = (
        "Listen to this audio carefully. It may be spoken in either "
        "English or Kannada. Transcribe exactly what the person is saying. "
        "If they speak in Kannada, write the Kannada script. If they speak "
        "in English, write the English text. Provide ONLY the transcribed "
        "text and nothing else."
    )

    try:
        # Convert audio to base64 for multimodal input
        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
        # Use retry logic for transcription
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type or 'audio/wav'};base64,{base64_audio}"
                            }
                        }
                    ]
                }
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return "[Audio not clear]"


async def generate_first_question(
    job_role: str, difficulty: str, resume_text: str | None = None
) -> str:
    # Always return "Tell about yourself" as the first question as requested.
    # This also saves API costs and ensures a consistent start.
    return (
        f"ನಮಸ್ಕಾರ! ನಿಮ್ಮ {job_role} ಸಂದರ್ಶನಕ್ಕೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ತಿಳಿಸಿ? "
        f"||| Hello! Welcome to your {job_role} interview. Tell me a little about yourself?"
    )


async def evaluate_answer_and_get_next(
    job_role: str, previous_messages: list, candidate_answer: str
) -> dict:
    if not is_configured or not client:
        if len(previous_messages) >= 5:
            return {
                "feedback": "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಸಂದರ್ಶನ ಪೂರ್ಣಗೊಂಡಿದೆ.",
                "next_question": None,
                "is_completed": True,
            }
        return {
            "feedback": f"{job_role} ಬಗ್ಗೆ ನಿಮ್ಮ ಉತ್ತರ ಚೆನ್ನಾಗಿದೆ.",
            "next_question": f"ಈ ಪಾತ್ರದಲ್ಲಿ ({job_role}) ನಿಮ್ಮ ತಾಂತ್ರಿಕ ಅನುಭವದ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ವಿವರಿಸಿ?",
            "is_completed": False,
        }

    history = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in previous_messages]
    )
    history += f"\ncandidate: {candidate_answer}"

    sample_qs = get_questions_for_role(job_role, limit=2)
    rubric_block = ""
    if sample_qs:
        rubric_block = "\nScoring rubric hints for this role (use to calibrate question depth):\n"
        for ex in sample_qs:
            rubric_block += f"- [{ex['category']}] {ex['question']}\n"
            for hint in ex['ideal_answer_hints'][:2]:
                rubric_block += f"    • {hint}\n"

    question_prompt = f"""
    Job Role: {job_role}
    {rubric_block}
    Conversation History:
    {history}

    Task:
    1. Analyze the candidate's last answer: "{candidate_answer}"
    2. If the interview has covered enough ground (approx 6-8 substantial exchanges), decide if it's time to conclude.
    3. If not concluding, generate a specific follow-up question in Kannada that deep-dives into a technical detail,
       a scenario, or a tool mentioned in the candidate's last answer.
    4. Ensure the question is NOT generic. It must be unique to this specific conversation.
    5. If concluding, set "is_completed" to true.

    Format your response as a valid JSON object:
    {{
        "next_question": "Your specific follow-up question in Kannada ||| English translation (or null if is_completed is true)",
        "is_completed": boolean
    }}
    """

    feedback_prompt = f"""
    You are a professional interviewer. Evaluate the candidate's answer: "{candidate_answer}".
    If the answer is incorrect or fundamentally flawed, explicitly state that it is wrong and briefly explain why.
    If the answer is correct but missing points, provide constructive feedback.
    If the answer is fully correct, acknowledge it positively.
    Keep the feedback very brief (1-2 sentences).
    Do not ask a question here. Just feedback.
    Provide the Kannada feedback first, followed by ' ||| ' and then the English translation.
    """

    try:
        q_task = call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": QUESTION_SYSTEM_INSTRUCTION},
                {"role": "user", "content": question_prompt}
            ],
            response_format={"type": "json_object"}
        )
        f_task = call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[
                {"role": "user", "content": feedback_prompt}
            ]
        )
        
        q_resp, f_resp = await asyncio.gather(q_task, f_task)
        
        q_text = q_resp.choices[0].message.content.strip()
        f_text = f_resp.choices[0].message.content.strip()
        
        # Parse JSON for question
        try:
            q_data = json.loads(q_text)
        except:
            json_match = re.search(r"\{.*\}", q_text, re.DOTALL)
            if json_match:
                q_data = json.loads(json_match.group(0))
            else:
                raise ValueError("Could not parse JSON from response")
        
        return {
            "feedback": f_text,
            "next_question": q_data.get("next_question"),
            "is_completed": q_data.get("is_completed", False),
        }
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        return {
            "feedback": "ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಗಮನಿಸಿದೆವು.",
            "next_question": f"{job_role} ಪಾತ್ರದ ಬಗ್ಗೆ ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ: ಈ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ಬಳಸುವ ಮುಖ್ಯ ಸಾಧನಗಳ ಬಗ್ಗೆ ತಿಳಿಸಿ?",
            "is_completed": False,
        }


async def generate_final_results(job_role: str, messages: list) -> dict:
    if not is_configured or not client:
        return {
            "overall_feedback": (
                "ನೀವು ಸಂದರ್ಶನದಲ್ಲಿ ಉತ್ತಮವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿದ್ದೀರಿ. "
                "(You performed well in the interview.)"
            ),
            "score": 85,
        }

    history = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in messages]
    )

    sample_qs = get_questions_for_role(job_role, limit=3)
    rubric_lines = ""
    if sample_qs:
        rubric_lines = "\nUse the following domain rubric to calibrate your score:\n"
        for ex in sample_qs:
            rubric_lines += f"- {ex['category']}: {ex['question']}\n"
            for hint in ex['ideal_answer_hints']:
                rubric_lines += f"    • {hint}\n"

    prompt = f"""
    You are an expert AI interviewer evaluating a candidate for the role of '{job_role}'.
    {rubric_lines}
    Here is the full interview transcript (in Kannada):
    {history}

    Provide a detailed, fair evaluation of the candidate's performance.
    Consider technical accuracy, depth of knowledge, communication clarity, and problem-solving approach.
    Format your response as a valid JSON object with the following keys:
    {{
        "overall_feedback": "Detailed overall feedback in Kannada ||| English translation (minimum 3 sentences)",
        "score": Integer score out of 100
    }}
    Ensure the output is ONLY the JSON object.
    """

    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )

        text = response.choices[0].message.content
        data = json.loads(text)
        return {
            "overall_feedback": data.get(
                "overall_feedback", "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ (Info not available)"
            ),
            "score": data.get("score", 0),
        }
    except Exception as e:
        print(f"Error generating results: {e}")
        return {
            "overall_feedback": "ಮೌಲ್ಯಮಾಪನ ದೋಷ. (Evaluation error.)",
            "score": 0,
        }


async def generate_interview_report(job_role: str, messages: list, overall_feedback: str, score: int) -> dict:
    """
    Generates a detailed interview performance report with confidence analysis,
    strengths, improvement areas, and a Q&A breakdown.
    """
    if not is_configured or not client:
        return {
            "confidence_score": 70,
            "confidence_analysis": "The candidate showed moderate confidence throughout the interview. ||| The candidate showed moderate confidence throughout the interview.",
            "strengths": "Good communication skills. ||| Good communication skills.",
            "improvements": "Work on technical depth. ||| Work on technical depth.",
            "qa_breakdown": [],
            "recommendation": "Recommended with reservations. ||| Recommended with reservations."
        }

    # Build Q&A pairs from messages
    qa_pairs = []
    i = 0
    while i < len(messages):
        if messages[i]['role'] == 'ai':
            question = messages[i]['content']
            answer = messages[i + 1]['content'] if (i + 1) < len(messages) and messages[i + 1]['role'] == 'user' else ""
            if answer:
                qa_pairs.append({"q": question, "a": answer})
            i += 2
        else:
            i += 1

    qa_text = "\n".join([f"Q{idx+1}: {pair['q']}\nA{idx+1}: {pair['a']}" for idx, pair in enumerate(qa_pairs)])

    prompt = f"""
    You are an expert HR analyst evaluating a candidate for the role of '{job_role}'.
    Overall score: {score}/100
    Overall feedback: {overall_feedback}

    Full interview Q&A:
    {qa_text}

    Provide a DETAILED, structured interview performance report. Analyze the following:
    1. Confidence level based on the answers (look for hedging language, decisiveness, specificity)
    2. Key strengths demonstrated
    3. Areas needing improvement
    4. A Q&A performance breakdown (rate each answer: "strong", "average", or "weak" and give a one-line note)
    5. Final hiring recommendation

    Format your response as a valid JSON object:
    {{
        "confidence_score": <integer 0-100, where 0=very low confidence, 100=very high confidence>,
        "confidence_analysis": "2-3 sentence analysis of candidate's confidence level in Kannada ||| English translation",
        "strengths": "3-4 bullet points of strengths (each on a new line starting with '•') in Kannada ||| English translation",
        "improvements": "3-4 bullet points of improvement areas (each on a new line starting with '•') in Kannada ||| English translation",
        "qa_breakdown": [
            {{"question_num": 1, "rating": "strong"|"average"|"weak", "note": "one-line note in English"}},
            ...
        ],
        "recommendation": "Final 1-sentence recommendation in Kannada ||| English translation"
    }}
    Return ONLY the JSON object.
    """

    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=3000
        )

        text = response.choices[0].message.content.strip()
        try:
            data = json.loads(text)
        except:
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(0))
            else:
                raise ValueError("Could not parse JSON from report response")

        return {
            "confidence_score": int(data.get("confidence_score", 50)),
            "confidence_analysis": data.get("confidence_analysis", "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| Info not available"),
            "strengths": data.get("strengths", "• ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| • Info not available"),
            "improvements": data.get("improvements", "• ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| • Info not available"),
            "qa_breakdown": data.get("qa_breakdown", []),
            "recommendation": data.get("recommendation", "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| Info not available"),
        }
    except Exception as e:
        print(f"Error generating interview report: {e}")
        return {
            "confidence_score": 50,
            "confidence_analysis": "ವಿಶ್ಲೇಷಣೆ ದೋಷ. ||| Analysis error.",
            "strengths": "• ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| • Info not available",
            "improvements": "• ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| • Info not available",
            "qa_breakdown": [],
            "recommendation": "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ ||| Info not available",
        }

async def evaluate_candidate_eligibility(eligibility_criteria: str, candidate_data: dict) -> dict:
    """
    Evaluates a candidate against job eligibility criteria using AI.
    """
    if not is_configured or not client:
        # Mock evaluation if AI not configured
        return {
            "is_eligible": True,
            "reason": "ನಿಮ್ಮ ಅನುಭವವು ಈ ಕೆಲಸಕ್ಕೆ ಸೂಕ್ತವಾಗಿದೆ. (Your experience is suitable for this job.)"
        }

    prompt = f"""
    You are an expert recruiter. Evaluate this candidate for eligibility based on the given criteria.
    
    Eligibility Criteria:
    {eligibility_criteria}
    
    Candidate Data:
    Name: {candidate_data.get('name')}
    Experience: {candidate_data.get('experience')}
    Location: {candidate_data.get('location')}
    Other Details: {candidate_data.get('other_details', 'N/A')}
    
    Determine if the candidate is eligible. 
    Provide:
    1. is_eligible: boolean
    2. reason: A brief reason in Kannada ||| English translation.
    
    Return ONLY a valid JSON object:
    {{
        "is_eligible": boolean,
        "reason": "Brief reason in Kannada ||| English"
    }}
    """

    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        text = response.choices[0].message.content.strip()
        data = json.loads(text)
        return {
            "is_eligible": data.get("is_eligible", False),
            "reason": data.get("reason", "ಅನರ್ಹ (Ineligible)")
        }
    except Exception as e:
        print(f"Error evaluating eligibility: {e}")
        return {"is_eligible": False, "reason": "ಮೌಲ್ಯಮಾಪನ ದೋಷ (Evaluation error)"}

async def generate_job_info(title: str, location: str) -> dict:
    """
    Generates Job Description, Requirements, and Eligibility criteria using AI.
    """
    if not is_configured or not client:
        return {
            "description": f"This is a role for a {title} in {location}. You will be responsible for handling day-to-day operations and ensuring high quality service.",
            "requirements": "• Good communication skills\n• Punctuality and dedication\n• Ability to work in a team",
            "eligibility": "• Minimum 18 years of age\n• Basic understanding of the role\n• Local language proficiency"
        }

    prompt = f"""
    You are an expert recruiter for the Indian job market, specifically focusing on roles in {location}.
    Generate professional job details for the following position:
    
    Job Title: {title}
    Location: {location}
    
    Provide:
    1. A concise Job Description (2-3 sentences).
    2. 3-4 specific Focus Areas/Skills the AI Interviewer should test for (as a bulleted list).
    3. Clear, strict Eligibility Criteria for candidate screening (e.g., experience, location, specific certifications).
    
    Return ONLY a valid JSON object:
    {{
        "description": "Job description here...",
        "requirements": "Focus areas list here...",
        "eligibility": "Eligibility criteria here..."
    }}
    """

    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        text = response.choices[0].message.content.strip()
        data = json.loads(text)
        return {
            "description": data.get("description", ""),
            "requirements": data.get("requirements", ""),
            "eligibility": data.get("eligibility", "")
        }
    except Exception as e:
        print(f"Error generating job info: {e}")
        return {
            "description": "",
            "requirements": "",
            "eligibility": ""
        }


async def generate_resume_from_profile(prompt: str) -> str:
    """
    Generates a professional resume summary from profile details.
    """
    if not is_configured or not client:
        return "ಸರಳ ಪ್ರೊಫೈಲ್ ರೆಸ್ಯೂಮ್ (Simple Profile Resume)"

    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating resume from profile: {e}")
        return "ರೆಸ್ಯೂಮ್ ತಯಾರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ (Could not generate resume)"


async def parse_job_description(jd_text: str) -> dict:
    """
    Extracts skills, requirements, and eligibility criteria from a raw JD text.
    """
    if not is_configured or not client:
        return {
            "title": "Extracted Job",
            "skills": ["Communication", "Teamwork"],
            "eligibility": "Basic requirements extracted from text.",
            "description": jd_text[:200] + "..."
        }

    prompt = f"""
    Analyze the following Job Description (JD) and extract key information:
    
    JD Text:
    {jd_text}
    
    Extract:
    1. Job Title
    2. Top 5 Technical/Soft Skills
    3. Eligibility Criteria (Experience, Education, etc.)
    4. A concise 2-sentence summary.
    
    Return ONLY a JSON object:
    {{
        "title": "Job Title",
        "skills": ["Skill 1", "Skill 2", ...],
        "eligibility": "Eligibility criteria summary...",
        "description": "2-sentence summary..."
    }}
    """
    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Error parsing JD: {e}")
        return {"title": "Unknown", "skills": [], "eligibility": "", "description": ""}


async def generate_adaptive_question_pool(job_role: str, skills: list) -> dict:
    """
    Generates a pool of 'easy' and 'difficult' questions in Kannada for a job role.
    """
    if not is_configured or not client:
        return {
            "easy": [{"q": "ಸರಳ ಪ್ರಶ್ನೆ? (Simple question?)", "category": "General"}],
            "difficult": [{"q": "ಕಠಿಣ ಪ್ರಶ್ನೆ? (Difficult question?)", "category": "Technical"}]
        }

    prompt = f"""
    Generate a technical interview question pool for the role of '{job_role}'.
    Focus on these skills: {', '.join(skills)}
    
    Generate 5 'easy' questions and 5 'difficult' questions.
    Each question must be in Kannada script, followed by its English translation.
    
    Format as JSON:
    {{
        "easy": [
            {{"q": "Kannada Question ||| English Translation", "category": "Core Concept"}},
            ...
        ],
        "difficult": [
            {{"q": "Kannada Question ||| English Translation", "category": "Advanced Problem"}},
            ...
        ]
    }}
    """
    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Error generating question pool: {e}")
        return {"easy": [], "difficult": []}


async def get_embedding(text: str) -> list:
    """
    Generates a vector embedding for a given text.
    Uses OpenAI style embedding API if available, else returns mock.
    """
    if not is_configured or not client:
        return [0.0] * 1536  # Mock embedding

    try:
        # Note: Using text-embedding-3-small via OpenRouter if available
        response = await client.embeddings.create(
            input=[text],
            model="text-embedding-3-small"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return [0.0] * 1536


async def extract_profile_from_voice(transcript: str) -> dict:
    """
    Extracts structured profile data (name, skills, experience, location) from a voice transcript.
    """
    if not is_configured or not client:
        return {
            "skills": ["Communication"],
            "experience": "Extracted from voice",
            "location": "Unknown"
        }

    prompt = f"""
    Analyze the following transcript from a candidate describing themselves:
    "{transcript}"
    
    Extract the following information:
    1. Skills (as a list of strings)
    2. Years of Experience or a summary of work history
    3. Current Location
    4. A professional resume summary in Kannada (formatted with English translation after ' ||| ')
    
    Return ONLY a JSON object:
    {{
        "skills": ["Skill 1", "Skill 2", ...],
        "experience": "Experience summary...",
        "location": "City/Region",
        "resume_text": "Professional summary in Kannada ||| English translation"
    }}
    """
    try:
        response = await call_ai_with_retry(
            client.chat.completions.create,
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Error extracting profile from voice: {e}")
        return {"skills": [], "experience": "", "location": "", "resume_text": ""}
