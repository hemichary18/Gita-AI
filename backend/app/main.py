from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="GitaAI Backend")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "https://gita-ai-alpha.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Warning: SUPABASE_URL or SUPABASE_KEY missing.")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY missing.")

# Initialize Embedding Model
print("Loading embedding model BAAI/bge-m3...")
try:
    embedding_model = SentenceTransformer("BAAI/bge-m3")
except Exception as e:
    print(f"Error loading embedding model: {e}")
    embedding_model = None

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"

class Shloka(BaseModel):
    chapter: int
    verse: int
    sanskrit: str
    translation: str

class ChatResponse(BaseModel):
    response: str
    emotion_detected: str
    shloka: Optional[Shloka] = None

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not sb:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API not configured")
    if not embedding_model:
        raise HTTPException(status_code=500, detail="Embedding model not loaded")

    # 1. Embed query
    query_emb = embedding_model.encode(request.query).tolist()

    # 2. Hybrid search in Supabase
    try:
        res = sb.rpc(
            "hybrid_search",
            {"query_text": request.query, "query_embedding": query_emb, "match_count": 3}
        ).execute()
        matches = res.data
    except Exception as e:
        print(f"Supabase search error: {e}")
        matches = []

    # Prepare context and retrieve best translation if matched
    context_text = ""
    best_shloka_data = None

    if matches and len(matches) > 0:
        top_match = matches[0]
        # fetch translation
        trans_res = sb.table("translations").select("*").eq("shloka_id", top_match["id"]).eq("language", "en").execute()
        translation_text = trans_res.data[0]["description"] if trans_res.data else "Translation not available"
        
        best_shloka_data = Shloka(
            chapter=top_match["chapter_number"],
            verse=top_match["verse_number"],
            sanskrit=top_match["sanskrit_text"],
            translation=translation_text
        )

        for i, match in enumerate(matches):
            context_text += f"\nShloka {match['chapter_number']}:{match['verse_number']}\n{match['sanskrit_text']}\n"

    # 3. Call Gemini
    prompt = f"""
    You are Krishna, offering comforting and wise guidance based on the Bhagavad Gita to a modern seeker.
    The user says: "{request.query}"
    
    Here is some context from the Gita that might be relevant:
    {context_text}
    
    Respond with profound, comforting wisdom. Speak in the first person as Krishna. Do not be overly verbose.
    Keep the response highly compassionate and insightful. 
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        response = model.generate_content(prompt)
        llm_text = response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        llm_text = "I am here for you. Find peace in the eternal truth."

    # Very basic emotion detection stub
    emotion = "Reflective"
    if "sad" in request.query.lower() or "overwhelmed" in request.query.lower():
        emotion = "Anxiety"

    return ChatResponse(
        response=llm_text,
        emotion_detected=emotion,
        shloka=best_shloka_data
    )

@app.get("/quote")
async def get_daily_quote():
    return {"quote": "You have the right to work, but never to the fruit of work.", "reference": "Chapter 2, Verse 47"}

@app.get("/auth")
async def auth_endpoint():
    return {"token": "ephemeral_jwt_stub"}

@app.get("/getToken")
async def get_livekit_token(participant_name: str = "Seeker"):
    from livekit.api import AccessToken, VideoGrants
    
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="LiveKit keys missing in backend environment")
        
    token = AccessToken(api_key, api_secret)
    token.with_identity(participant_name)
    token.with_name(participant_name)
    token.with_grants(VideoGrants(
        room_join=True,
        room="gita-sanctuary",
    ))
    
    return {"token": token.to_jwt()}
