import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient

# Re-use DB connection logic
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "kannada_interview_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
jobs_collection = db["jobs"]
users_collection = db["users"]

async def seed_jobs():
    # Try to find an admin user to assign these jobs to
    admin = await users_collection.find_one({"role": "admin"})
    admin_id = str(admin["_id"]) if admin else "system"

    jobs = [
        {
            "title": "Delivery Executive",
            "location": "Bengaluru, Karnataka",
            "salary": "₹18,000 - ₹25,000 + Incentives",
            "description": "Deliver packages across the city. Flexible shifts available.",
            "requirements": "Must own a smartphone. Ability to navigate using maps.",
            "eligibility": "Must have a valid two-wheeler driving license, own a bike/scooter, and be able to read basic English/Kannada names.",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "recruiter_id": admin_id
        },
        {
            "title": "Customer Support Executive (Kannada)",
            "location": "Hubballi / Remote",
            "salary": "₹15,000 - ₹22,000 per month",
            "description": "Handle customer queries over phone and chat in Kannada.",
            "requirements": "Typing skills in Kannada. Polite communication.",
            "eligibility": "Fluent in Kannada (speaking/writing), basic computer knowledge, 12th pass or Graduate.",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "recruiter_id": admin_id
        },
        {
            "title": "Warehouse Associate",
            "location": "Nelamangala, Bengaluru",
            "salary": "₹16,000 - ₹20,000 per month",
            "description": "Loading, unloading, and inventory management in a large warehouse.",
            "requirements": "Willingness to work in shifts. Basic counting skillsPhysically fit for heavy lifting, 10th pass, basic counting skills, punctuality..",
            "eligibility": "Physically fit for heavy lifting, 10th pass, basic counting skills, punctuality.",
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "recruiter_id": admin_id
        }
    ]
    
    # Delete existing jobs with these titles to avoid clutter during testing
    titles = [j["title"] for j in jobs]
    await jobs_collection.delete_many({"title": {"$in": titles}})
    
    result = await jobs_collection.insert_many(jobs)
    print(f"Successfully seeded {len(result.inserted_ids)} jobs.")

if __name__ == "__main__":
    asyncio.run(seed_jobs())
