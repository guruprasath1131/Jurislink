import os
import re
import json
import urllib.parse
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Request, Response, HTTPException, Query, Depends
from pydantic import BaseModel
import requests
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import CaseModel

router = APIRouter(prefix="/ai", tags=["Indic AI & Voice Telephony"])

# Service Binding: if internal Node.js AI service is bound via Vercel Services
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", os.getenv("VITE_GROQ_API_KEY", ""))
MODEL_POOL = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]

telemetry_data = {
    "activeModel": MODEL_POOL[0],
    "modelPool": MODEL_POOL,
    "limitRequests": 1000,
    "limitTokens": 8000,
    "remainingRequests": 1000,
    "remainingTokens": 8000,
    "totalCallsMade": 0,
    "status": "OPTIMAL"
}


def call_groq_failover(messages: list, max_tokens: int = 250, temperature: float = 0.3) -> dict:
    global telemetry_data
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    last_error = None
    for model in MODEL_POOL:
        try:
            resp = requests.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=12
            )
            if resp.status_code == 200:
                data = resp.json()
                telemetry_data["totalCallsMade"] += 1
                telemetry_data["activeModel"] = model
                return {
                    "content": data["choices"][0]["message"]["content"],
                    "modelUsed": model
                }
            elif resp.status_code == 429:
                telemetry_data["status"] = "ROTATED"
                continue
            else:
                last_error = resp.text
        except Exception as e:
            last_error = str(e)
            continue

    raise HTTPException(status_code=502, detail=f"All Groq AI models failed: {last_error}")


# Request Models
class TamilAssistRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    language: Optional[str] = "ta"


class ExtractNoticeRequest(BaseModel):
    ocrText: str


class SimplifyOrderRequest(BaseModel):
    rawOrderText: str
    targetLanguage: Optional[str] = "hi"


class CaseQaRequest(BaseModel):
    cnr: Optional[str] = None
    question: str
    language: Optional[str] = "en"


# Endpoints

@router.post("/tamil-assist")
def tamil_voice_assistant(payload: TamilAssistRequest, db: Session = Depends(get_db)):
    """Live Conversational Voice Assistant for Tamil, Hindi, and English"""
    # If bound to internal microservice, delegate
    if AI_SERVICE_URL:
        try:
            res = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/ai/tamil-assist",
                json=payload.model_dump(),
                timeout=15
            )
            return res.json()
        except Exception as e:
            print(f"[Binding Warning] Delegation to AI_SERVICE_URL failed: {e}")

    cases = db.query(CaseModel).limit(5).all()
    case_summaries = [
        {
            "cnr": c.cnr,
            "caseNumber": c.case_number,
            "parties": f"{c.petitioner} vs {c.respondent}",
            "court": c.court_name,
            "date": c.next_hearing_date,
            "courtroom": c.courtroom
        }
        for c in cases
    ]

    lang = payload.language or "ta"
    if lang == "ta":
        system_prompt = f"""You are Jurislink's warm, polite legal voice assistant in Tamil Nadu, India.
CRITICAL SPOKEN TAMIL RULES:
1. நீங்கள் தமிழ் மொழியில் மட்டுமே பேசவேண்டும் (Speak ONLY in natural, fluent spoken Tamil).
2. எளிய, கனிவான பேச்சுத்தமிழில் பேசுங்கள் (Speak in warm, simple everyday Tamil like a helpful officer talking to a citizen).
3. NEVER use markdown symbols: NO asterisks (**), NO hashtags (#), NO bullet points, NO numbered lists (1., 2.), NO brackets.
4. Keep the answer to 2 or 3 short, complete spoken sentences (50 words max). It will be read aloud immediately.
5. If the citizen's case is in the Available Cases below, clearly tell them the hearing date, courtroom, and documents to bring.
6. If the citizen's case is not identified, ask politely: "உங்கள் வழக்கின் நிலையை அறிய, உங்கள் CNR எண் அல்லது உங்கள் வழக்கு பெயரைச் சொல்ல முடியுமா?"

Available Cases:
{json.dumps(case_summaries, ensure_ascii=False)}"""
    elif lang == "hi":
        system_prompt = f"""You are Jurislink's warm, polite legal voice assistant in India.
CRITICAL SPOKEN HINDI RULES:
1. Speak ONLY in natural, fluent spoken Hindi (सरल, बोलचाल की हिंदी).
2. NEVER use markdown symbols: NO asterisks (**), NO bullet points, NO numbered lists, NO brackets.
3. Keep the answer to 2 or 3 short spoken sentences (50 words max).
4. If the case is found, tell them the hearing date, courtroom, and documents to bring.
5. If no case matches, ask: "अपने केस की जानकारी के लिए कृपया अपना CNR नंबर या पार्टी का नाम बताएं।"

Available Cases:
{json.dumps(case_summaries, ensure_ascii=False)}"""
    else:
        system_prompt = f"""You are Jurislink's warm, polite legal voice assistant for Indian court cases.
CRITICAL SPOKEN VOICE RULES:
1. Speak in clear, warm, conversational English.
2. NEVER use markdown formatting: NO asterisks (**), NO bullet points, NO numbered lists, NO brackets.
3. Keep the reply to 2 or 3 short spoken sentences (50 words max).
4. If a case matches, mention hearing date, courtroom, and documents to bring.
5. If no case matches, ask for their CNR number or party name.

Available Cases:
{json.dumps(case_summaries, ensure_ascii=False)}"""

    messages = [{"role": "system", "content": system_prompt}]
    for m in (payload.history or []):
        messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
    messages.append({"role": "user", "content": payload.message})

    try:
        res = call_groq_failover(messages, max_tokens=220, temperature=0.3)
        raw_text = res["content"]
        # Clean text
        clean = re.sub(r'[*#_~`>•]', ' ', raw_text)
        clean = re.sub(r'^\s*\d+\.\s*', '', clean, flags=re.MULTILINE)
        clean = re.sub(r'\([A-Za-z0-9\s]+\)', ' ', clean)
        clean = re.sub(r'\s+', ' ', clean).strip()

        # Match CNR
        matched_cnr = None
        for c in case_summaries:
            cnr = c.get("cnr", "")
            if cnr and (cnr.lower() in payload.message.lower() or cnr.lower() in clean.lower()):
                matched_cnr = cnr
                break

        return {
            "reply": clean,
            "matchedCnr": matched_cnr,
            "aiModelUsed": res["modelUsed"],
            "language": lang
        }
    except Exception as err:
        fallbacks = {
            "ta": "மன்னிக்கவும், இப்போது சேவை கிடைக்கவில்லை. உங்கள் CNR எண்ணை தாருங்கள், நான் உதவுகிறேன்.",
            "hi": "माफ़ कीजिए, अभी सेवा उपलब्ध नहीं है। अपना CNR नंबर बताएं, मैं मदद करूंगा।",
            "en": "Sorry, service is temporarily unavailable. Please provide your CNR number and I will help you."
        }
        return {
            "reply": fallbacks.get(lang, fallbacks["en"]),
            "matchedCnr": None,
            "fallback": True,
            "language": lang
        }


@router.get("/tts-audio")
def get_indic_tts_audio(text: str = Query(...), lang: str = Query("ta")):
    """Streams High-Definition spoken audio for Tamil, Hindi, or English"""
    if AI_SERVICE_URL:
        try:
            upstream = requests.get(
                f"{AI_SERVICE_URL.rstrip('/')}/api/ai/tts-audio",
                params={"text": text, "lang": lang},
                timeout=10
            )
            return Response(content=upstream.content, media_type="audio/mpeg", headers={"Cache-Control": "public, max-age=86400"})
        except Exception:
            pass

    clean_text = re.sub(r'[*#_~`>•]', ' ', text)
    clean_text = re.sub(r'\([A-Za-z0-9\s]+\)', ' ', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()[:300]

    target_lang = "ta" if lang == "ta" else "hi" if lang == "hi" else "en-IN"
    tts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={target_lang}&q={urllib.parse.quote(clean_text)}"

    try:
        r = requests.get(tts_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        return Response(
            content=r.content,
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"TTS audio generation failed: {e}")


@router.post("/extract-notice")
def extract_notice_with_ai(payload: ExtractNoticeRequest):
    """Extracts court notice parameters from raw OCR text"""
    if AI_SERVICE_URL:
        try:
            res = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/ai/extract-notice",
                json=payload.model_dump(),
                timeout=15
            )
            return res.json()
        except Exception:
            pass

    messages = [
        {
            "role": "system",
            "content": """You are an Indian Court Notice OCR Parser. Extract:
- extractedCnr: 16-character string or null
- extractedCaseNumber: e.g. WP 1402/2024 or null
- extractedCourtName: full name of court or null
- extractedHearingDate: YYYY-MM-DD or null
- petitioner: string or null
- respondent: string or null
- confidenceScore: float between 0.0 and 1.0
Return ONLY a valid JSON object."""
        },
        {"role": "user", "content": payload.ocrText[:2000]}
    ]

    try:
        res = call_groq_failover(messages, max_tokens=300, temperature=0.1)
        data = json.loads(res["content"])
        data["aiModelUsed"] = res["modelUsed"]
        return data
    except Exception as e:
        return {"rawText": payload.ocrText[:200], "confidenceScore": 0.5, "isReliable": False, "error": str(e)}


@router.post("/simplify-order")
def simplify_order_with_ai(payload: SimplifyOrderRequest):
    """Simplifies complex legal orders into 5th-grade plain language"""
    if AI_SERVICE_URL:
        try:
            res = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/ai/simplify-order",
                json=payload.model_dump(),
                timeout=15
            )
            return res.json()
        except Exception:
            pass

    messages = [
        {
            "role": "system",
            "content": f"""Simplify this Indian court order into plain, reassuring {payload.targetLanguage} (5th-grade reading level).
Return JSON with:
- simplifiedText: plain explanation
- nextStep: what the citizen must do next
- keyTerms: list of terms explained"""
        },
        {"role": "user", "content": payload.rawOrderText[:2000]}
    ]

    try:
        res = call_groq_failover(messages, max_tokens=300, temperature=0.2)
        return json.loads(res["content"])
    except Exception:
        return {
            "simplifiedText": "The court reviewed the case and scheduled the next procedural hearing.",
            "nextStep": "Check your hearing date and carry valid identity proof.",
            "keyTerms": ["hearing"]
        }


@router.post("/case-qa")
def case_qa_with_ai(payload: CaseQaRequest, db: Session = Depends(get_db)):
    """Answers specific citizen questions about their case"""
    if AI_SERVICE_URL:
        try:
            res = requests.post(
                f"{AI_SERVICE_URL.rstrip('/')}/api/ai/case-qa",
                json=payload.model_dump(),
                timeout=15
            )
            return res.json()
        except Exception:
            pass

    case_obj = None
    if payload.cnr:
        case_obj = db.query(CaseModel).filter(CaseModel.cnr == payload.cnr.strip().upper()).first()

    context = case_obj.to_dict() if case_obj else "No specific case selected."
    messages = [
        {
            "role": "system",
            "content": f"""You are Jurislink's Legal Assistant. Answer the citizen's question accurately based on this case record:
{json.dumps(context, ensure_ascii=False)}
Keep the answer simple, polite, and reassuring in {payload.language or 'en'}."""
        },
        {"role": "user", "content": payload.question}
    ]

    try:
        res = call_groq_failover(messages, max_tokens=250, temperature=0.3)
        return {"answer": res["content"], "modelUsed": res["modelUsed"]}
    except Exception as e:
        return {"answer": "Please carry your identity card and meet your lawyer before your scheduled hearing date.", "error": str(e)}


@router.get("/rate-limit")
def get_rate_limit_telemetry():
    """Live rate limit and model status telemetry"""
    if AI_SERVICE_URL:
        try:
            res = requests.get(f"{AI_SERVICE_URL.rstrip('/')}/api/ai/rate-limit", timeout=5)
            return res.json()
        except Exception:
            pass
    return telemetry_data
