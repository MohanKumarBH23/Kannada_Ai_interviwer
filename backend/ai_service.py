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
MODEL_NAME = os.getenv("GEMINI_MODEL", "google/gemini-2.5-flash")

QUESTION_SYSTEM_INSTRUCTION = (
    "You are an empathetic, culturally aware, and highly professional AI Interviewer "
    "specialized in assessing candidates for operational, frontline, and blue-collar roles "
    "(such as Delivery Executives, Commercial Drivers, Security Guards, Warehouse Associates, "
    "Electricians, Plumbers, Customer Support, Retail Helpers, and Technicians) in Karnataka. "
    "Your core guidelines for high-accuracy evaluation:\n"
    "1. Language & Format: Ask all questions in clear, conversational, natural Kannada, "
    "followed by ' ||| ' and the English translation.\n"
    "2. Realistic Practical Focus: Ask practical, scenario-based questions about everyday job situations, "
    "safety protocols, problem-solving, customer courtesy, punctuality, and equipment handling—NOT academic or coding jargon.\n"
    "3. Candidate Empathy: Candidates may be under-educated or speak colloquial Kannada or Kanglish. "
    "Assess their core competence, honesty, safety awareness, and work ethic fairly without penalizing for grammar or lack of English.\n"
    "4. Natural Adaptive Follow-ups: Acknowledge what the candidate stated in their previous response and build naturally upon it."
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
    from training_data import normalize_role
    canonical_role = normalize_role(job_role)
    return (
        f"ನಮಸ್ಕಾರ! ನಿಮ್ಮ {canonical_role} ಸಂದರ್ಶನಕ್ಕೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ನಿಮ್ಮ ಹಿಂದಿನ ಕೆಲಸದ ಅನುಭವದ ಬಗ್ಗೆ ಸಂಕ್ಷಿಪ್ತವಾಗಿ ತಿಳಿಸಿ? "
        f"||| Hello! Welcome to your {canonical_role} interview. Please tell me briefly about yourself and your past work experience."
    )


async def evaluate_answer_and_get_next(
    job_role: str, previous_messages: list, candidate_answer: str
) -> dict:
    from training_data import normalize_role, get_questions_for_role
    canonical_role = normalize_role(job_role)
    user_turns = sum(1 for msg in previous_messages if msg.get("role") == "user") + 1
    sample_qs = get_questions_for_role(canonical_role, limit=4)

    if not is_configured or not client:
        if user_turns >= 4:
            return {
                "feedback": (
                    "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಎಲ್ಲಾ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಸಂದರ್ಶನ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ. "
                    "||| Thank you! All your responses have been evaluated. Your interview has been successfully completed."
                ),
                "next_question": None,
                "is_completed": True,
            }
        asked_texts = [msg.get("content", "") for msg in previous_messages]
        next_q = None
        for q_entry in sample_qs:
            q_text = q_entry["question"]
            if not any(q_text[:20] in a for a in asked_texts):
                next_q = q_text
                break
        if not next_q:
            next_q = (
                f"{canonical_role} ಕೆಲಸದಲ್ಲಿ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಮಯಪಾಲನೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವೇನು? "
                f"||| What are your thoughts on safety and punctuality in this {canonical_role} role?"
            )
        return {
            "feedback": (
                "ಉತ್ತಮ ವಿವರಣೆ ನೀಡಿದ್ದೀರಿ. ನಿಮ್ಮ ಪ್ರಾಯೋಗಿಕ ಅನುಭವ ತಿಳಿಯಿತು. "
                "||| Good explanation. Your practical experience is noted."
            ),
            "next_question": next_q,
            "is_completed": False,
        }

    history = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in previous_messages]
    )
    history += f"\ncandidate: {candidate_answer}"

    rubric_block = ""
    if sample_qs:
        rubric_block = "\nCurated Domain Rubric for this role (use to calibrate question depth and assess answer accuracy):\n"
        for ex in sample_qs:
            rubric_block += f"- [{ex['category']}] {ex['question']}\n"
            for hint in ex.get('ideal_answer_hints', []):
                rubric_block += f"    • {hint}\n"

    should_conclude_hint = "Conclude the interview now by setting is_completed to true and next_question to null" if user_turns >= 4 else "Generate a specific, relevant situational follow-up question"

    question_prompt = f"""
    Job Role: {canonical_role}
    Interview Turn: {user_turns} of 4
    {rubric_block}
    Conversation History:
    {history}

    Task:
    1. Analyze the candidate's last answer: "{candidate_answer}"
    2. Turn guidance:
       - If Turn 1: Ask about core daily tasks and equipment/tools/vehicle handling.
       - If Turn 2: Ask a practical situational problem/scenario (e.g. handling customer issues, damaged goods, or traffic delay).
       - If Turn 3: Ask a safety, emergency response, or punctuality/integrity question.
       - If Turn 4 or more: {should_conclude_hint}.
    3. Ensure the question is in clean, spoken Kannada with English translation after ' ||| '.
    4. Keep questions realistic and grounded in everyday blue-collar operations—NO abstract or programming terminology.

    Format your response as a valid JSON object:
    {{
        "next_question": "Kannada question ||| English translation (or null if is_completed is true)",
        "is_completed": boolean
    }}
    """

    feedback_prompt = f"""
    You are an encouraging and fair interviewer assessing a candidate for the role of '{canonical_role}'.
    Candidate's answer: "{candidate_answer}".
    Evaluate whether the candidate demonstrates practical competence, honesty, safety awareness, or relevant experience for a {canonical_role}.
    Note: The candidate may speak colloquial Kannada or brief sentences. Evaluate intent and practical correctness.
    Provide constructive feedback in 1-2 friendly sentences.
    Format: [Kannada Feedback] ||| [English Translation].
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
        if user_turns >= 4:
            return {
                "feedback": (
                    "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಎಲ್ಲಾ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಸಂದರ್ಶನ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ. "
                    "||| Thank you! All your responses have been evaluated. Your interview has been successfully completed."
                ),
                "next_question": None,
                "is_completed": True,
            }
        asked_texts = [msg.get("content", "") for msg in previous_messages]
        next_q = None
        for q_entry in sample_qs:
            q_text = q_entry["question"]
            if not any(q_text[:20] in a for a in asked_texts):
                next_q = q_text
                break
        if not next_q:
            next_q = (
                f"{canonical_role} ಕೆಲಸದಲ್ಲಿ ಸುರಕ್ಷತೆ ಮತ್ತು ಸಮಯಪಾಲನೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವೇನು? "
                f"||| What are your thoughts on safety and punctuality in this {canonical_role} role?"
            )
        return {
            "feedback": (
                "ಧನ್ಯವಾದಗಳು, ನಿಮ್ಮ ಉತ್ತರವನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ. "
                "||| Thank you, your answer has been recorded."
            ),
            "next_question": next_q,
            "is_completed": False,
        }


async def generate_final_results(job_role: str, messages: list) -> dict:
    from training_data import normalize_role, get_questions_for_role
    canonical_role = normalize_role(job_role)
    
    if not is_configured or not client:
        return {
            "overall_feedback": (
                f"ನೀವು {canonical_role} ಸಂದರ್ಶನದಲ್ಲಿ ಉತ್ತಮ ಪ್ರಾಯೋಗಿಕ ಜ್ಞಾನ ಮತ್ತು ಸುರಕ್ಷತಾ ಕಾಳಜಿಯನ್ನು ಪ್ರದರ್ಶಿಸಿದ್ದೀರಿ. "
                "ಗ್ರಾಹಕ ಸೇವೆ ಮತ್ತು ಸಮಯಪಾಲನೆಯಲ್ಲಿ ನಿಮ್ಮ ಅನುಭವವು ಈ ಕೆಲಸಕ್ಕೆ ಸೂಕ್ತವಾಗಿದೆ. "
                f"||| You demonstrated good practical knowledge and safety awareness during the {canonical_role} interview. "
                "Your customer service and punctuality make you well-suited for this job."
            ),
            "score": 82,
        }

    history = "\n".join(
        [f"{msg['role']}: {msg['content']}" for msg in messages]
    )

    sample_qs = get_questions_for_role(canonical_role, limit=4)
    rubric_lines = ""
    if sample_qs:
        rubric_lines = "\nUse the following domain rubric to calibrate your score for this role:\n"
        for ex in sample_qs:
            rubric_lines += f"- [{ex['category']}]: {ex['question']}\n"
            for hint in ex.get('ideal_answer_hints', []):
                rubric_lines += f"    • {hint}\n"

    prompt = f"""
    You are an expert interviewer evaluating a candidate for the role of '{canonical_role}'.
    {rubric_lines}
    Here is the full interview transcript (in Kannada and English):
    {history}

    Evaluation Criteria for Operational & Blue-Collar Roles:
    1. Practical Competence: Did the candidate demonstrate real-world knowledge of tools, vehicles, rules, or processes?
    2. Safety Awareness: Did they prioritize safety (road safety, electrical earthing, emergency stops, fire precautions)?
    3. Reliability & Punctuality: Did they show dedication, honesty, and readiness for shift work?
    4. Communication & Courtesy: Did they communicate respectfully in Kannada?

    Calibrated Scoring Standards:
    - 85 - 100: Exceptional candidate with strong experience, clear safety knowledge, and polite demeanor.
    - 70 - 84: Competent candidate with good basic skills and positive attitude; suitable for hire.
    - 50 - 69: Candidate with limited experience or partial answers; needs on-the-job training.
    - Below 50: Ineligible or unsafe answers.

    Format your response as a valid JSON object:
    {{
        "overall_feedback": "Detailed overall feedback in Kannada ||| English translation (minimum 3 sentences)",
        "score": Integer score between 0 and 100
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
            "confidence_score": 78,
            "confidence_analysis": (
                "ಅಭ್ಯರ್ಥಿಯು ಪ್ರಶ್ನೆಗಳಿಗೆ ನೇರವಾಗಿ ಮತ್ತು ವಿಶ್ವಾಸದಿಂದ ಉತ್ತರಿಸಿದ್ದಾರೆ. ಪ್ರಾಯೋಗಿಕ ಕೆಲಸದ ಅನುಭವವು ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುತ್ತದೆ. "
                "||| The candidate answered questions directly and with confidence. Practical work experience is clearly demonstrated."
            ),
            "strengths": (
                "• ಉತ್ತಮ ವಾಹನ ಮತ್ತು ರಸ್ತೆ ಸುರಕ್ಷತೆ ಜ್ಞಾನ ||| • Strong vehicle and operational safety awareness\n"
                "• ಗ್ರಾಹಕರೊಂದಿಗೆ ವಿನಮ್ರ ಸಂಭಾಷಣೆ ಕೌಶಲ್ಯ ||| • Polite and courteous communication\n"
                "• ಸಮಯಪಾಲನೆ ಮತ್ತು ಕೆಲಸದ ನಿಷ್ಠೆ ||| • Demonstrated punctuality and commitment to work"
            ),
            "improvements": (
                "• ಆಪ್‌ನಲ್ಲಿ ಡಿಜಿಟಲ್ ಪಾವತಿ ಸಮಸ್ಯೆಗಳನ್ನು ನಿಭಾಯಿಸುವುದರಲ್ಲಿ ಇನ್ನಷ್ಟು ಅಭ್ಯಾಸ ಅಗತ್ಯ ||| • Practice handling digital app payment disputes\n"
                "• ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಲ್ಲಿ ಹಬ್ ಮ್ಯಾನೇಜರ್‌ಗೆ ತ್ವರಿತ ವರದಿ ಮಾಡುವಿಕೆ ||| • Quicker escalation to hub manager during peak emergencies"
            ),
            "qa_breakdown": [
                {"question_num": 1, "rating": "strong", "note": "Clear self-introduction with past work history."},
                {"question_num": 2, "rating": "strong", "note": "Accurate practical knowledge of core daily duties."},
                {"question_num": 3, "rating": "average", "note": "Understood customer situation well, can improve conflict de-escalation."},
                {"question_num": 4, "rating": "strong", "note": "Demonstrated high safety vigilance and adherence to rules."}
            ],
            "recommendation": (
                "ಈ ಹುದ್ದೆಗೆ ನೇಮಕ ಮಾಡಿಕೊಳ್ಳಲು ಸೂಕ್ತವಾಗಿದ್ದಾರೆ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ). "
                "||| Suitable for hire for this role (Recommended)."
            )
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
        from training_data import get_questions_for_role
        easy_list = get_questions_for_role(job_role, difficulty="easy", limit=4)
        hard_list = get_questions_for_role(job_role, difficulty="hard", limit=4)
        return {
            "easy": [{"q": q["question"], "category": q["category"]} for q in easy_list] or [{"q": f"{job_role} ಕೆಲಸದ ಬಗ್ಗೆ ಸರಳ ಪ್ರಶ್ನೆ? ||| Basic question for {job_role}?", "category": "Core Duties"}],
            "difficult": [{"q": q["question"], "category": q["category"]} for q in hard_list] or [{"q": f"{job_role} ಕೆಲಸದಲ್ಲಿ ಕಠಿಣ ಸನ್ನಿವೇಶ ಹೇಗೆ ನಿಭಾಯಿಸುತ್ತೀರಿ? ||| How do you handle difficult situations in {job_role}?", "category": "Problem Solving"}]
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
