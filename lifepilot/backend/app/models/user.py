from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class Location(BaseModel):
    name: str = Field(description="e.g., Home, Work")
    address: str = Field(description="Full address for accurate delivery fees")
    is_default: bool = False

class UserProfile(BaseModel):
    diet: Optional[str] = "veg"
    allergies: List[str] = []
    spice_tolerance: Optional[str] = "Medium"
    saved_locations: List[Location] = []
    default_budget_inr: Optional[int] = 300
    favorite_dishes: List[str] = []
    preferred_restaurants: List[str] = []
    preferred_platforms: List[str] = []

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    email: EmailStr
    hashed_password: str
    profile: UserProfile = Field(default_factory=UserProfile)

class UserResponse(BaseModel):
    email: EmailStr
    profile: UserProfile

class Token(BaseModel):
    access_token: str
    token_type: str
