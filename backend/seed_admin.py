import asyncio
import os
import sys
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add current directory to path so we can import auth
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from auth import get_password_hash

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.kannada_interview_db
users_collection = db.users


async def seed_users():
    # 1. Admin Account
    admin_email = "admin@admin.com"
    admin_password = "admin123"
    hashed_admin_pw = get_password_hash(admin_password)

    await users_collection.update_one(
        {"email": admin_email},
        {
            "$set": {
                "name": "Platform Admin",
                "hashed_password": hashed_admin_pw,
                "role": "admin",
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            }
        },
        upsert=True
    )

    # 2. Dedicated Recruiter Account
    recruiter_email = "recruiter@recruiter.com"
    recruiter_password = "recruiter123"
    hashed_recruiter_pw = get_password_hash(recruiter_password)

    await users_collection.update_one(
        {"email": recruiter_email},
        {
            "$set": {
                "name": "Karnataka Talent Recruiter",
                "hashed_password": hashed_recruiter_pw,
                "role": "recruiter",
            },
            "$setOnInsert": {
                "created_at": datetime.now(timezone.utc),
            }
        },
        upsert=True
    )

    print("========================================")
    print("Default Login Credentials Ready:")
    print("----------------------------------------")
    print(f"Recruiter Login: {recruiter_email} / {recruiter_password}")
    print(f"Admin Login:     {admin_email} / {admin_password}")
    print("========================================")


if __name__ == "__main__":
    asyncio.run(seed_users())
