import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.kannada_interview_db
interviews_collection = db.get_collection("interviews")
users_collection = db.get_collection("users")
question_bank_collection = db.get_collection("question_bank")


async def get_db():
    return db
