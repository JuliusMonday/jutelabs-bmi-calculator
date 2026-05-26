import os
import re
import time
from datetime import datetime
from pathlib import Path
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from google.api_core import exceptions

load_dotenv()

logging.basicConfig(
    level=os.getenv("AI_SERVICE_LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI()

allowed_origins_env = os.getenv(
    "AI_SERVICE_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("GOOGLE_API_KEY environment variable is required for the AI service.")
genai.configure(api_key=api_key)

MODEL_NAME = os.getenv("AI_MODEL", "gemini-2.0-flash")
model = genai.GenerativeModel(MODEL_NAME)

CACHE_TTL_SECONDS = int(os.getenv("AI_CACHE_TTL_SECONDS", "300"))
CACHE_MAX_ENTRIES = int(os.getenv("AI_CACHE_MAX_ENTRIES", "200"))
analysis_cache = {}

PROMPT_FILE_PATH = Path(__file__).resolve().parent / "prompt_template.txt"

if not PROMPT_FILE_PATH.exists():
    raise RuntimeError(f"Prompt template file not found at {PROMPT_FILE_PATH}")

PROMPT_TEMPLATE = PROMPT_FILE_PATH.read_text(encoding="utf-8").strip()

class BmiRequest(BaseModel):
    weight_kg: float = Field(..., gt=0, le=635)
    height_m: float = Field(..., gt=0.3, le=3.0)

class HeightRequest(BaseModel):
    feet: float = Field(..., ge=0, le=8)
    inches: float = Field(..., ge=0, lt=12)


def _cleanup_cache():
    now = time.time()
    expired_keys = [key for key, (timestamp, _, _) in analysis_cache.items() if now - timestamp > CACHE_TTL_SECONDS]
    for key in expired_keys:
        analysis_cache.pop(key, None)
    if len(analysis_cache) > CACHE_MAX_ENTRIES:
        oldest_entries = sorted(analysis_cache.items(), key=lambda item: item[1][0])
        for key, _ in oldest_entries[: len(analysis_cache) - CACHE_MAX_ENTRIES]:
            analysis_cache.pop(key, None)


def _cache_key(weight_kg: float, height_m: float) -> str:
    return f"{weight_kg:.2f}:{height_m:.3f}"


def _get_cached_response(weight_kg: float, height_m: float):
    _cleanup_cache()
    key = _cache_key(weight_kg, height_m)
    entry = analysis_cache.get(key)
    if not entry:
        return None
    _, bmi, advice = entry
    return bmi, advice


def _set_cached_response(weight_kg: float, height_m: float, bmi: float, advice: str):
    _cleanup_cache()
    key = _cache_key(weight_kg, height_m)
    analysis_cache[key] = (time.time(), bmi, advice)


def _sanitize_ai_response(raw_text: str) -> str:
    cleaned = raw_text.strip().strip('"')
    if re.match(r'^(here is\b|here\'s\b)', cleaned.strip().lower()):
        first_line, _, rest = cleaned.partition('\n')
        cleaned = rest.strip() if rest else cleaned
    return cleaned

@app.post("/analyze-health")
def analyze_health(data: BmiRequest):
    # --- 2. ROUNDING FIX ---
    # Changed from 2 to 1 so 5.19 becomes 5.2 to match the AI's logic
    bmi = round(data.weight_kg / (data.height_m * data.height_m), 1)
    
    doctor_name = "Dr. JuTe"
    prompt = PROMPT_TEMPLATE.format(doctor_name=doctor_name, bmi=bmi)

    cache_hit = _get_cached_response(data.weight_kg, data.height_m)
    if cache_hit:
        cached_bmi, cached_advice = cache_hit
        return {"bmi": cached_bmi, "advice": cached_advice}

    try:
        # Priority: Gemini 2.0 Flash
        try:
            response = model.generate_content(prompt)
        except exceptions.ResourceExhausted:
            logger.warning("Gemini 2.0 quota exceeded; attempting fallback to 2.5-flash.")
            try:
                fallback_model = genai.GenerativeModel('gemini-2.5-flash')
                response = fallback_model.generate_content(prompt)
            except exceptions.ResourceExhausted:
                logger.warning("Gemini 2.5 quota exceeded; attempting fallback to gemini-flash-latest.")
                try:
                    fallback_model_2 = genai.GenerativeModel('gemini-flash-latest')
                    response = fallback_model_2.generate_content(prompt)
                except exceptions.ResourceExhausted:
                    raise

        if response is None:
            raise HTTPException(status_code=502, detail='AI model did not return a valid response.')

        advice_text = getattr(response, 'text', None)
        if not isinstance(advice_text, str):
            raise HTTPException(status_code=502, detail='Invalid AI response format.')

        cleaned_advice = _sanitize_ai_response(advice_text)
        _set_cached_response(data.weight_kg, data.height_m, bmi, cleaned_advice)
        return {'bmi': bmi, 'advice': cleaned_advice}
    except exceptions.ResourceExhausted:
        logger.error("All Gemini API quotas exhausted.")
        raise HTTPException(status_code=429, detail="AI quota exceeded. Please wait a minute or check your API key.")
    except exceptions.InvalidArgument:
        logger.warning("Invalid AI request parameters.")
        raise HTTPException(status_code=400, detail="Invalid request parameters.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Internal AI Error: %s", str(e))
        raise HTTPException(status_code=500, detail="Internal AI service error.")

@app.post("/convert-height")
def convert_height(data: HeightRequest):
    meters = (data.feet * 0.3048) + (data.inches * 0.0254)
    return {"meters": round(meters, 2)}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }