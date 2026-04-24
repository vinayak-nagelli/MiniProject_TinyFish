from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.groq_service import parse_intent
from app.models.schemas import UserIntent
from app.api.auth import get_current_user

router = APIRouter()

class IntentRequest(BaseModel):
    user_input: str

@router.post("/parse-intent", response_model=UserIntent)
async def parse_user_intent(request: IntentRequest, current_user: dict = Depends(get_current_user)):
    try:
        # We pass the user's secure database profile into the LLM
        intent = await parse_intent(request.user_input, current_user.get("profile", {}))
        return intent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
