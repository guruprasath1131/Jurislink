from typing import Optional
from fastapi import APIRouter, Depends, Request, Response, Form
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import IvrCallLogModel, CaseModel

router = APIRouter(prefix="/ivr", tags=["IVR Telephony (Twilio & Exotel)"])

@router.post("/twilio", response_class=Response)
async def twilio_webhook(
    request: Request,
    Digits: Optional[str] = Form(None),
    CallSid: Optional[str] = Form(None),
    From: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Twilio Voice Webhook Handler:
    Returns standard TwiML XML for 2G feature phones calling 1800-JURIS-LINK.
    """
    call_sid = CallSid or "CALL-SIMULATED"
    caller = From or "UNKNOWN"
    digits = Digits or ""

    # Log interaction
    log = IvrCallLogModel(
        call_sid=call_sid,
        caller_number=caller,
        digits_pressed=digits,
        last_step="MENU" if digits else "WELCOME"
    )
    db.add(log)
    db.commit()

    if not digits:
        # Welcome & Language Selection
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/ivr/twilio" method="POST">
        <Say language="hi-IN">न्याय सेतु में आपका स्वागत है। हिंदी के लिए 1 दबाएं।</Say>
        <Say language="en-IN">Welcome to Jurislink. For English, press 2.</Say>
        <Say language="ta-IN">தமிழுக்கு 3 ஐ அழுத்தவும்.</Say>
    </Gather>
</Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Handle language or menu choice
    if digits == "1":
        # Hindi Main Menu
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/ivr/twilio" method="POST">
        <Say language="hi-IN">अपने केस की स्थिति जानने के लिए 1 दबाएं। सीएनआर दर्ज करने के लिए 2 दबाएं। मुफ्त कानूनी सहायता के लिए 4 दबाएं।</Say>
    </Gather>
</Response>"""
        return Response(content=twiml, media_type="application/xml")
    elif digits == "4":
        # NALSA Legal Aid
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="hi-IN">राष्ट्रीय विधिक सेवा प्राधिकरण (NALSA) की निशुल्क हेल्पलाइन 15100 पर संपर्क करें।</Say>
    <Dial>15100</Dial>
</Response>"""
        return Response(content=twiml, media_type="application/xml")
    else:
        # English fallback
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="en-IN">You selected option {digits}. Your next hearing is scheduled on September 8 at Court Room 14.</Say>
    <Pause length="1"/>
    <Say language="en-IN">Thank you for calling Jurislink.</Say>
</Response>"""
        return Response(content=twiml, media_type="application/xml")


@router.post("/exotel")
async def exotel_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Exotel Voice Applet Webhook Handler:
    Returns JSON flow payload for Indian cloud telephony integration.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    digits = body.get("Digits", "")
    caller = body.get("From", "UNKNOWN")

    # Record log
    log = IvrCallLogModel(
        call_sid=body.get("CallSid", "EXOTEL-SIM"),
        caller_number=caller,
        digits_pressed=digits,
        last_step="EXOTEL_FLOW"
    )
    db.add(log)
    db.commit()

    return {
        "status": "success",
        "action": "play_and_gather",
        "prompt": "Welcome to Jurislink Legal Helpline. Press 1 for Hindi, 2 for English.",
        "dtmf_received": digits,
        "nalsa_helpline": "15100"
    }


@router.get("/logs")
def get_ivr_logs(db: Session = Depends(get_db)):
    """Retrieve audit history of IVR phone interactions."""
    logs = db.query(IvrCallLogModel).order_by(IvrCallLogModel.timestamp.desc()).limit(20).all()
    return [l.to_dict() for l in logs]
