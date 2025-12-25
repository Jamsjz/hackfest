from fastapi import APIRouter, HTTPException
from app.reqtypes import schemas

router = APIRouter()

@router.post("/message")
async def chat_message(request: schemas.ChatRequest):
    # AI logic has been moved to the frontend directly for better responsiveness
    return {
        "response": "Processing moved to client-side. Please ensure the frontend is correctly configured."
    }
