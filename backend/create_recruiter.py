import asyncio
from database import users_collection
from auth import get_password_hash
from datetime import datetime, timezone

async def create_recruiter():
    # Credentials
    email = "recruiter@example.com"
    password = "password123"
    name = "Recruiter Admin"
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        print(f"User {email} already exists. Updating role to recruiter...")
        await users_collection.update_one(
            {"email": email},
            {"$set": {"role": "recruiter", "name": name}}
        )
    else:
        # Create new recruiter
        hashed_password = get_password_hash(password)
        new_user = {
            "name": name,
            "email": email,
            "hashed_password": hashed_password,
            "role": "recruiter",
            "created_at": datetime.now(timezone.utc),
        }
        await users_collection.insert_one(new_user)
        print(f"Created new recruiter: {email}")
    
    print("\n----------------------------------")
    print("RECRUITER CREDENTIALS:")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("----------------------------------\n")

if __name__ == "__main__":
    asyncio.run(create_recruiter())
