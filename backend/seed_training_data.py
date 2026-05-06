"""
One-time script to seed the MongoDB question_bank collection with training data.
Run with: python seed_training_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

from training_data import get_all_questions

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.kannada_interview_db
    collection = db.get_collection("question_bank")

    questions = get_all_questions()
    inserted = 0
    skipped = 0

    for q in questions:
        # Idempotent: skip if exact question already exists
        existing = await collection.find_one({"question": q["question"]})
        if existing:
            skipped += 1
            continue
        await collection.insert_one(q)
        inserted += 1

    print(f"[OK] Seeding complete: {inserted} inserted, {skipped} skipped.")
    print(f"     Total in question_bank: {await collection.count_documents({})}")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
