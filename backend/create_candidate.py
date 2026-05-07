import asyncio
from database import users_collection
from auth import get_password_hash
from datetime import datetime, timezone

async def create_candidate():
    # Credentials
    email = "candidate@example.com"
    password = "password123"
    name = "Test Candidate"
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": email})
    if existing_user:
        print(f"User {email} already exists. Updating role to candidate...")
        await users_collection.update_one(
            {"email": email},
            {"$set": {"role": "user", "name": name}}
        )
    else:
        # Create new candidate (role 'user' is the default for candidates)
        hashed_password = get_password_hash(password)
        new_user = {
            "name": name,
            "email": email,
            "hashed_password": hashed_password,
            "role": "user",
            "created_at": datetime.now(timezone.utc),
        }
        await users_collection.insert_one(new_user)
        print(f"Created new candidate: {email}")
    
    print("\n----------------------------------")
    print("CANDIDATE CREDENTIALS:")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("----------------------------------\n")

if __name__ == "__main__":
    asyncio.run(create_candidate())
