from typing import List, Optional
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import CaseModel, HearingEventModel, AuditLogModel
from ..schemas import CaseSchema

router = APIRouter(prefix="/cases", tags=["Court Cases"])

@router.get("", response_model=List[CaseSchema])
def search_cases(
    party_name: Optional[str] = Query(None, alias="partyName"),
    case_number: Optional[str] = Query(None, alias="caseNumber"),
    court_name: Optional[str] = Query(None, alias="courtName"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Search court cases by party name, case number, or court name."""
    query = db.query(CaseModel)

    if party_name:
        party_pattern = f"%{party_name.strip()}%"
        query = query.filter(
            or_(
                CaseModel.petitioner.ilike(party_pattern),
                CaseModel.respondent.ilike(party_pattern)
            )
        )

    if case_number:
        query = query.filter(CaseModel.case_number.ilike(f"%{case_number.strip()}%"))

    if court_name:
        query = query.filter(CaseModel.court_name.ilike(f"%{court_name.strip()}%"))

    cases = query.limit(limit).all()
    return [c.to_dict() for c in cases]


@router.get("/{cnr}", response_model=CaseSchema)
def get_case_by_cnr(cnr: str, db: Session = Depends(get_db)):
    """Retrieve full authentic case details, timeline events, and plain language summaries by 16-character CNR."""
    cleaned_cnr = cnr.strip().upper()
    case_obj = db.query(CaseModel).filter(CaseModel.cnr == cleaned_cnr).first()

    if not case_obj:
        # Also try matching without dashes
        no_dashes = cleaned_cnr.replace("-", "")
        cases = db.query(CaseModel).all()
        for c in cases:
            if c.cnr.replace("-", "").upper() == no_dashes:
                case_obj = c
                break

    if not case_obj:
        raise HTTPException(status_code=404, detail=f"Case record with CNR '{cnr}' not found on eCourts / NJDG grid.")

    # Record audit log
    audit = AuditLogModel(
        action="CASE_LOOKUP",
        entity="Case",
        entity_id=case_obj.cnr,
        details=f"Lookup for {case_obj.case_number} in {case_obj.court_name}"
    )
    db.add(audit)
    db.commit()

    return case_obj.to_dict()


@router.post("", response_model=CaseSchema)
def create_case(case_in: CaseSchema, db: Session = Depends(get_db)):
    """Register or sync a new case record from eCourts pipeline."""
    existing = db.query(CaseModel).filter(CaseModel.cnr == case_in.cnr).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Case with CNR '{case_in.cnr}' already exists.")

    new_case = CaseModel(
        cnr=case_in.cnr,
        case_number=case_in.caseNumber,
        court_name=case_in.courtName,
        court_type=case_in.courtType,
        state=case_in.state,
        district=case_in.district,
        petitioner=case_in.petitioner,
        respondent=case_in.respondent,
        filing_date=case_in.filingDate,
        registration_date=case_in.registrationDate,
        status=case_in.status,
        stage=case_in.stage,
        judge=case_in.judge,
        courtroom=case_in.courtroom,
        next_hearing_date=case_in.nextHearingDate,
        last_hearing_date=case_in.lastHearingDate,
        summary_past_json=json.dumps(case_in.summaryPast or {}),
        summary_next_json=json.dumps(case_in.summaryNext or {}),
        what_to_do_json=json.dumps(case_in.whatToDo or {}),
        qr_code_data=case_in.qrCodeData
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Insert events if provided
    if case_in.events:
        for ev in case_in.events:
            event_obj = HearingEventModel(
                case_cnr=new_case.cnr,
                event_date=ev.date,
                event_type=ev.type,
                purpose=ev.purpose,
                business_recorded=ev.businessRecorded,
                judge=ev.judge,
                order_pdf_url=ev.orderPdfUrl,
                simplified_summary_json=json.dumps(ev.simplifiedSummary or {})
            )
            db.add(event_obj)
        db.commit()

    return new_case.to_dict()
