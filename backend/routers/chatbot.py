from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.schemas import ChatMessage, ChatResponse
from services.chatbot_engine import ChatbotEngine

router = APIRouter()
engine = ChatbotEngine()


@router.post("/message", response_model=ChatResponse)
async def chat(request: ChatMessage, user=Depends(get_current_user)):
    """Send a message to the AI chatbot."""
    reply, suggestions = engine.get_response(request.message, user)
    return ChatResponse(reply=reply, suggestions=suggestions)
