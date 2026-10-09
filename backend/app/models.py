import datetime
import json
from sqlalchemy import (
    Column, 
    String, 
    Text, 
    Integer, 
    DateTime, 
    ForeignKey, 
    Boolean
)
from sqlalchemy.orm import relationship
from .database import Base

class CaseModel(Base):
    __tablename__ = "cases"

    cnr = Column(String(32), primary_key=True, index=True)
    case_number = Column(String(64), index=True, nullable=False)
    court_name = Column(String(128), index=True, nullable=False)
    court_type = Column(String(32), default="HIGH_COURT")
    state = Column(String(64), default="")
    district = Column(String(64), default="")
    petitioner = Column(String(255), index=True, nullable=False)
    respondent = Column(String(255), index=True, nullable=False)
    filing_date = Column(String(32), default="")
    registration_date = Column(String(32), default="")
    status = Column(String(32), default="PENDING")
    stage = Column(String(64), default="")
    judge = Column(String(128), default="")
    courtroom = Column(String(64), default="")
    next_hearing_date = Column(String(32), nullable=True)
    last_hearing_date = Column(String(32), nullable=True)
    
    # Store localized summaries and action steps as JSON strings
    summary_past_json = Column(Text, default="{}")
    summary_next_json = Column(Text, default="{}")
    what_to_do_json = Column(Text, default="{}")
    qr_code_data = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    events = relationship("HearingEventModel", back_populates="case", cascade="all, delete-orphan")
    reminders = relationship("ReminderModel", back_populates="case", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "cnr": self.cnr,
            "caseNumber": self.case_number,
            "courtName": self.court_name,
            "courtType": self.court_type,
            "state": self.state,
            "district": self.district,
            "petitioner": self.petitioner,
            "respondent": self.respondent,
            "filingDate": self.filing_date,
            "registrationDate": self.registration_date,
            "status": self.status,
            "stage": self.stage,
            "judge": self.judge,
            "courtroom": self.courtroom,
            "nextHearingDate": self.next_hearing_date,
            "lastHearingDate": self.last_hearing_date,
            "summaryPast": json.loads(self.summary_past_json or "{}"),
            "summaryNext": json.loads(self.summary_next_json or "{}"),
            "whatToDo": json.loads(self.what_to_do_json or "{}"),
            "qrCodeData": self.qr_code_data,
            "events": [event.to_dict() for event in self.events] if self.events else []
        }


class HearingEventModel(Base):
    __tablename__ = "hearing_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    case_cnr = Column(String(32), ForeignKey("cases.cnr", ondelete="CASCADE"), index=True, nullable=False)
    event_date = Column(String(32), nullable=False)
    event_type = Column(String(64), default="HEARING")
    purpose = Column(String(128), default="")
    business_recorded = Column(Text, default="")
    judge = Column(String(128), default="")
    order_pdf_url = Column(String(255), nullable=True)
    simplified_summary_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("CaseModel", back_populates="events")

    def to_dict(self):
        return {
            "id": str(self.id),
            "date": self.event_date,
            "type": self.event_type,
            "purpose": self.purpose,
            "businessRecorded": self.business_recorded,
            "judge": self.judge,
            "orderPdfUrl": self.order_pdf_url,
            "simplifiedSummary": json.loads(self.simplified_summary_json or "{}")
        }


class ReminderModel(Base):
    __tablename__ = "reminders"

    id = Column(String(64), primary_key=True, index=True)
    case_cnr = Column(String(32), ForeignKey("cases.cnr", ondelete="CASCADE"), index=True, nullable=False)
    user_phone = Column(String(20), index=True, nullable=False)
    hearing_date = Column(String(32), nullable=False)
    scheduled_date = Column(String(32), nullable=False)
    reminder_type = Column(String(32), default="HEARING_REMINDER")
    status = Column(String(32), default="PENDING")  # PENDING, SENT, CANCELLED
    message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("CaseModel", back_populates="reminders")

    def to_dict(self):
        return {
            "id": self.id,
            "caseCnr": self.case_cnr,
            "userPhone": self.user_phone,
            "hearingDate": self.hearing_date,
            "scheduledDate": self.scheduled_date,
            "type": self.reminder_type,
            "status": self.status,
            "message": self.message,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class IvrCallLogModel(Base):
    __tablename__ = "ivr_call_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_sid = Column(String(64), index=True)
    caller_number = Column(String(20), default="")
    selected_language = Column(String(8), default="en")
    last_step = Column(String(64), default="")
    digits_pressed = Column(String(64), default="")
    duration_seconds = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "callSid": self.call_sid,
            "callerNumber": self.caller_number,
            "selectedLanguage": self.selected_language,
            "lastStep": self.last_step,
            "digitsPressed": self.digits_pressed,
            "durationSeconds": self.duration_seconds,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(64), index=True, nullable=False)
    entity = Column(String(64), default="")
    entity_id = Column(String(64), default="")
    details = Column(Text, default="")
    client_ip = Column(String(45), default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "entity": self.entity,
            "entityId": self.entity_id,
            "details": self.details,
            "clientIp": self.client_ip,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
