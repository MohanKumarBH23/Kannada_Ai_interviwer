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


async def seed_admin():
    admin_email = "admin@admin.com"
    admin_password = "admin123"

    existing_admin = await users_collection.find_one({"email": admin_email})

    if existing_admin:
        print(f"Admin user already exists: {admin_email}")
        return

    hashed_password = get_password_hash(admin_password)

    new_admin = {
        "name": "Admin User",
        "email": admin_email,
        "hashed_password": hashed_password,
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    }


    await users_collection.insert_one(new_admin)
    print(
        f"Successfully created admin user: {admin_email} "
        f"with password: {admin_password}"
    )


if __name__ == "__main__":

    asyncio.run(seed_admin())
