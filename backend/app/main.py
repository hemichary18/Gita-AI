from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

app = FastAPI(title="GitaAI Backend")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "https://gita-ai-alpha.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class QuoteResponse(BaseModel):
    quote: str
    reference: str

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    return {"message": "Chat endpoint stub. RAG pipeline to be implemented.", "reply": "Hari Om"}

@app.get("/quote", response_model=QuoteResponse)
async def get_daily_quote():
    return {"quote": "You have the right to work, but never to the fruit of work.", "reference": "Chapter 2, Verse 47"}

@app.get("/auth")
async def auth_endpoint():
    return {"token": "ephemeral_jwt_stub"}

@app.websocket("/voice")
async def websocket_endpoint(websocket):
    await websocket.accept()
    await websocket.send_text("LiveKit WebSocket signaling stub.")
    await websocket.close()
