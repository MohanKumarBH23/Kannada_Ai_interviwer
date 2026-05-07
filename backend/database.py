import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
DB_NAME = os.getenv("DB_NAME", "kannada_interview_db")
db = client[DB_NAME]
interviews_collection = db.get_collection("interviews")
users_collection = db.get_collection("users")
question_bank_collection = db.get_collection("question_bank")
jobs_collection = db.get_collection("jobs")
candidates_collection = db.get_collection("candidates")


async def get_db():
    return db
