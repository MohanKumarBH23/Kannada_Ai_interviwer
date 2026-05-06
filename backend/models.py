from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


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
    ats_score: Optional[int] = None
    ats_feedback: Optional[str] = None
    resume_text: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    profile_picture: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    profile_picture: Optional[str] = None


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
