
import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from app.reqtypes import schemas
from dotenv import load_dotenv

load_dotenv("app/.env")

router = APIRouter()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

@router.post("/message")
async def chat_message(request: schemas.ChatRequest):
    if not API_KEY:
        # Return a mock response if no API key is configured
        return {
            "response": "नमस्ते! server configuration issue: API Key missing. I am running in demo mode. (कृषिबिद)"
        }

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_instruction = """You are "कृषिबिद" (Krishibid), a helpful, friendly, and knowledgeable Nepali farming assistant AI (AgriBot). 
    You speak in a mix of English and Nepali (Romanized or Devanagari) to help farmers.
    You provide advice on crops, weather, diseases, and irrigation.
    Keep answers concise and actionable."""

        if request.context:
            system_instruction += f"\n\nCURRENT CONTEXT (The user is looking at this analysis/report right now):\n{request.context}\n\nAnswer the user's questions specifically about this context if applicable."

        # Convert history to Gemini format
        # Gemini expects 'user' and 'model' roles. 
        gemini_history = []
        for msg in request.history:
            role = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.text]})

        chat = model.start_chat(history=gemini_history)
        
        # Add system instruction as a preamble if needed, or if library supports it directly (v1beta)
        # For simplicity with basic SDK, we often wrap the prompt or rely on model persona.
        # But 'system_instruction' is supported in newer models/SDK versions.
        # If not supported in installed version, we can prepend to history or last message.
        # Here we prepend to the last message for safety if system_instruction param isn't available in `start_chat` or `GenerativeModel` init in this specific version.
        # However, checking `google-generativeai>=0.8.6` means it likely supports system instructions in `GenerativeModel`.
        
        # Re-initializing model with system instruction
        model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_instruction)
        chat = model.start_chat(history=gemini_history)

        response = chat.send_message(request.message)
        return {"response": response.text}

    except Exception as e:
        print(f"Gemini Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
