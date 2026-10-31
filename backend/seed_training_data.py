"""
Script to seed the MongoDB question_bank collection with curated blue-collar training data.
Run with: python backend/seed_training_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from training_data import get_all_questions, get_all_blue_collar_roles

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.kannada_interview_db
    collection = db.get_collection("question_bank")

    questions = get_all_questions()
    upserted = 0

    for q in questions:
        await collection.update_one(
            {"question": q["question"]},
            {"$set": q},
            upsert=True
        )
        upserted += 1

    total_count = await collection.count_documents({})
    roles = await collection.distinct("role")
    
    print(f"[OK] Question bank seeded successfully: {upserted} questions processed.")
    print(f"     Total documents in question_bank: {total_count}")
    print(f"     Distinct roles covered ({len(roles)}): {', '.join(sorted(roles))}")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
