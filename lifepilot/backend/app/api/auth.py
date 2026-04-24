from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserInDB, Token, UserResponse, UserProfile
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.db.mongodb import db
from datetime import timedelta
import jwt

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            getattr(settings, 'SECRET_KEY', "SUPER_SECRET_KEY"), 
            algorithms=[getattr(settings, 'ALGORITHM', "HS256")]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # We must await the motor collection
    user = await db.client["lifepilot"]["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    collection = db.client["lifepilot"]["users"]
    
    # Check if user exists
    existing_user = await collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = UserInDB(email=user.email, hashed_password=hashed_password, profile=UserProfile())
    
    # Save to MongoDB
    await collection.insert_one(new_user.model_dump())
    
    return UserResponse(email=new_user.email, profile=new_user.profile)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    collection = db.client["lifepilot"]["users"]
    user = await collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=getattr(settings, 'ACCESS_TOKEN_EXPIRE_MINUTES', 60*24*7))
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(email=current_user["email"], profile=current_user["profile"])
