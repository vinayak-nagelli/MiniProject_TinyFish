from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict
from app.models.user import UserProfile, UserResponse
from app.api.auth import get_current_user
from app.db.mongodb import db

router = APIRouter()


@router.put("/me/profile", response_model=UserResponse)
async def update_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    try:
        collection = db.client["lifepilot"]["users"]
        await collection.update_one(
            {"email": current_user["email"]},
            {"$set": {"profile": profile.model_dump()}}
        )
        updated_user = await collection.find_one({"email": current_user["email"]})
        return UserResponse(email=updated_user["email"], profile=updated_user["profile"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
