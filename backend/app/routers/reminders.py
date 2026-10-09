import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ReminderModel, CaseModel, AuditLogModel
from ..schemas import ReminderCreate, ReminderResponse

router = APIRouter(prefix="/reminders", tags=["Proactive Reminders & SMS"])

@router.get("", response_model=List[ReminderResponse])
def get_reminders(
    phone: Optional[str] = None,
    cnr: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve scheduled SMS hearing reminders."""
    query = db.query(ReminderModel)
    if phone:
        query = query.filter(ReminderModel.user_phone == phone.strip())
    if cnr:
        query = query.filter(ReminderModel.case_cnr == cnr.strip())
    
    reminders = query.order_by(ReminderModel.scheduled_date.asc()).all()
    return [r.to_dict() for r in reminders]


@router.post("", response_model=List[ReminderResponse])
def register_reminders(payload: ReminderCreate, db: Session = Depends(get_db)):
    """
    Register proactive reminders for upcoming hearing date.
    Calculates 7-day, 3-day, 1-day, and hearing-day morning alerts.
    If the hearing was rescheduled, cancels old pending alerts to avoid duplicate SMS.
    """
    case_obj = db.query(CaseModel).filter(CaseModel.cnr == payload.caseCnr).first()
    court_info = case_obj.court_name if case_obj else "the court"
    case_num = case_obj.case_number if case_obj else payload.caseCnr

    try:
        hearing_dt = datetime.datetime.strptime(payload.hearingDate, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid hearingDate format. Expected YYYY-MM-DD.")

    # 1. Reschedule check: Cancel previous PENDING reminders for this case with different hearing date
    old_pending = db.query(ReminderModel).filter(
        ReminderModel.case_cnr == payload.caseCnr,
        ReminderModel.user_phone == payload.userPhone,
        ReminderModel.status == "PENDING",
        ReminderModel.hearing_date != payload.hearingDate
    ).all()

    for old in old_pending:
        old.status = "CANCELLED"

    # 2. Compute proactive schedule intervals (7 days, 3 days, 1 day, 0 days)
    intervals = [
        (7, "7-Day Advance Notice", "Reminder: Your case {case_num} is scheduled in 7 days on {date} at {court}."),
        (3, "3-Day Preparation Alert", "Action needed: 3 days until hearing for {case_num} on {date}. Check documents."),
        (1, "1-Day Tomorrow Alert", "Urgent: Court hearing tomorrow for {case_num} on {date}. Meet advocate at {court}."),
        (0, "Morning-of Reminder", "Today is your hearing date for {case_num}. Please arrive by 10:00 AM.")
    ]

    created_reminders = []
    today = datetime.date.today()

    for days_before, label, template in intervals:
        scheduled_dt = hearing_dt - datetime.timedelta(days=days_before)
        scheduled_date_str = scheduled_dt.strftime("%Y-%m-%d")
        
        # Don't schedule notifications for dates in the past
        status = "PENDING"
        if scheduled_dt.date() < today:
            status = "SENT"

        msg = template.format(case_num=case_num, date=payload.hearingDate, court=court_info)
        rem_id = f"REM-{uuid.uuid4().hex[:8].upper()}"

        rem_obj = ReminderModel(
            id=rem_id,
            case_cnr=payload.caseCnr,
            user_phone=payload.userPhone,
            hearing_date=payload.hearingDate,
            scheduled_date=scheduled_date_str,
            reminder_type="HEARING_REMINDER",
            status=status,
            message=msg
        )
        db.add(rem_obj)
        created_reminders.append(rem_obj)

    # Add audit log
    audit = AuditLogModel(
        action="REMINDERS_REGISTERED",
        entity="Reminder",
        entity_id=payload.caseCnr,
        details=f"Scheduled {len(created_reminders)} SMS alerts for phone {payload.userPhone}"
    )
    db.add(audit)

    db.commit()
    for r in created_reminders:
        db.refresh(r)

    return [r.to_dict() for r in created_reminders]


@router.patch("/{reminder_id}/cancel")
def cancel_reminder(reminder_id: str, db: Session = Depends(get_db)):
    """Cancel a pending reminder."""
    rem = db.query(ReminderModel).filter(ReminderModel.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    rem.status = "CANCELLED"
    db.commit()
    return {"message": "Reminder cancelled successfully", "id": reminder_id}
