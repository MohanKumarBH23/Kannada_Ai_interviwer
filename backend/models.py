from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    bio: Optional[str] = None
    resume_text: Optional[str] = None


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: str
    role: str = "user"
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    resume_text: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class Message(BaseModel):
    role: str  # "user" or "ai"
    content: str
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
class InterviewSessionCreate(BaseModel):

    job_role: str
    difficulty: str = "medium"  # easy, medium, hard
    is_practice: bool = False


class InterviewSession(BaseModel):
    id: str = Field(alias="_id")
    job_role: str
    difficulty: str
    created_at: datetime
    messages: List[Message]
    status: str = "active"  # active, completed
    feedback: Optional[str] = None
    score: Optional[int] = None
    resume_text: Optional[str] = None
    user_id: Optional[str] = None
    job_id: Optional[str] = None
    candidate_id: Optional[str] = None
    is_practice: bool = False


class AnswerSubmit(BaseModel):
    session_id: str
    answer: str


class AnswerResponse(BaseModel):
    feedback: str
    next_question: Optional[str]
    is_completed: bool
    transcribed_text: Optional[str] = None


class InterviewResult(BaseModel):
    session_id: str
    overall_feedback: str
    score: int


class TrainingQuestion(BaseModel):
    role: str
    difficulty: str          # easy | medium | hard
    category: str            # DSA | System Design | Behavioral | Technical | HR
    question: str
    ideal_answer_hints: List[str]

class JobBase(BaseModel):
    title: str
    location: str
    salary: str
    description: str
    requirements: str
    eligibility: str

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: str = Field(alias="_id")
    is_active: bool = True
    created_at: datetime
    recruiter_id: Optional[str] = None

class CandidateBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    experience: Optional[str] = None
    location: Optional[str] = None
    other_details: Optional[str] = None

class CandidateCreate(CandidateBase):
    job_id: str

class Candidate(CandidateBase):
    id: str = Field(alias="_id")
    job_id: str
    status: str
    selection_status: Optional[str] = "Pending"  # Selected | Rejected | Pending
    eligibility_reason: Optional[str] = None
    interview_link: Optional[str] = None
    ai_score: Optional[int] = None
    ai_suitability: Optional[str] = None
    ai_summary: Optional[str] = None
    interview_completed_at: Optional[datetime] = None
    session_id: Optional[str] = None
    created_at: datetime
