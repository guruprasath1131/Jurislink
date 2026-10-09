from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class HearingEventSchema(BaseModel):
    id: Optional[str] = None
    date: str
    type: str = "HEARING"
    purpose: str = ""
    businessRecorded: str = ""
    judge: str = ""
    orderPdfUrl: Optional[str] = None
    simplifiedSummary: Optional[Dict[str, str]] = None

class CaseSchema(BaseModel):
    cnr: str = Field(..., description="16-character unique CNR number")
    caseNumber: str
    courtName: str
    courtType: str = "HIGH_COURT"
    state: str = ""
    district: str = ""
    petitioner: str
    respondent: str
    filingDate: str = ""
    registrationDate: str = ""
    status: str = "PENDING"
    stage: str = ""
    judge: str = ""
    courtroom: str = ""
    nextHearingDate: Optional[str] = None
    lastHearingDate: Optional[str] = None
    summaryPast: Optional[Dict[str, str]] = None
    summaryNext: Optional[Dict[str, str]] = None
    whatToDo: Optional[Dict[str, str]] = None
    qrCodeData: Optional[str] = None
    events: Optional[List[HearingEventSchema]] = []

class CaseSearchQuery(BaseModel):
    cnr: Optional[str] = None
    partyName: Optional[str] = None
    caseNumber: Optional[str] = None
    courtName: Optional[str] = None

class ReminderCreate(BaseModel):
    caseCnr: str
    userPhone: str
    hearingDate: str
    reminderType: str = "HEARING_REMINDER"

class ReminderResponse(BaseModel):
    id: str
    caseCnr: str
    userPhone: str
    hearingDate: str
    scheduledDate: str
    type: str
    status: str
    message: str
    createdAt: Optional[str] = None

class IvrWebhookRequest(BaseModel):
    CallSid: Optional[str] = None
    From: Optional[str] = None
    Digits: Optional[str] = None
    CallStatus: Optional[str] = None

class NlpSimplifyRequest(BaseModel):
    rawOrderText: str
    courtName: Optional[str] = "High Court"
    caseStatus: Optional[str] = "PENDING"

class NlpSimplifyResponse(BaseModel):
    simplifiedText: Dict[str, str]
    detectedEventType: str
    confidenceScore: float
    isReliable: bool
    lowConfidenceReason: Optional[str] = None
    extractedKeyTerms: List[str]
