import json
from .database import SessionLocal, engine, Base
from .models import CaseModel, HearingEventModel, ReminderModel, AuditLogModel

INITIAL_CASES = [
    {
        "cnr": "DLHC01-008472-2024",
        "case_number": "WP(C) 1402/2024",
        "court_name": "High Court of Delhi at New Delhi",
        "court_type": "HIGH_COURT",
        "state": "Delhi",
        "district": "New Delhi",
        "petitioner": "Rameshwar Dayal (Farmer Welfare Union)",
        "respondent": "Delhi Development Authority & Ors.",
        "filing_date": "2024-02-15",
        "registration_date": "2024-02-18",
        "status": "PENDING",
        "stage": "Final Arguments",
        "judge": "Hon'ble Mr. Justice R.K. Sharma & Hon'ble Ms. Justice P. Roy",
        "courtroom": "Court Room 14",
        "next_hearing_date": "2026-09-08",
        "last_hearing_date": "2024-07-22",
        "summary_past": {
            "en": "The court heard initial arguments regarding land compensation and directed government authorities to submit land records.",
            "hi": "अदालत ने ज़मीन के मुआवजे पर प्रारंभिक दलीलें सुनीं और अधिकारियों को ज़मीन का रिकॉर्ड जमा करने का निर्देश दिया।"
        },
        "summary_next": {
            "en": "Final arguments from both lawyers will take place. The judge will decide on the stay and compensation amount.",
            "hi": "दोनों पक्षों के वकीलों की अंतिम बहस होगी। जज साहब मुआवजे की राशि और रोक पर फैसला सुनाएंगे।"
        },
        "what_to_do": {
            "en": "Be present at Court Room 14 by 10:00 AM with your identity card and advocate.",
            "hi": "सुबह 10:00 बजे अपने पहचान पत्र और वकील के साथ कोर्ट रूम 14 में उपस्थित रहें।"
        },
        "events": [
            {
                "event_date": "2024-03-10",
                "event_type": "ORDER_PASSED",
                "purpose": "First Admission & Notice",
                "business_recorded": "Notice issued. Status quo to be maintained regarding possession till next hearing.",
                "judge": "Hon'ble Mr. Justice R.K. Sharma"
            },
            {
                "event_date": "2024-07-22",
                "event_type": "HEARING",
                "purpose": "Counter Affidavit Filed",
                "business_recorded": "Counter affidavit taken on record. Relist for final arguments.",
                "judge": "Hon'ble Mr. Justice R.K. Sharma"
            }
        ]
    },
    {
        "cnr": "MCHC01-003921-2023",
        "case_number": "FA 589/2023",
        "court_name": "High Court of Judicature at Bombay",
        "court_type": "HIGH_COURT",
        "state": "Maharashtra",
        "district": "Mumbai",
        "petitioner": "Sunita Suresh Shinde",
        "respondent": "Maharashtra State Electricity Distribution Co.",
        "filing_date": "2023-06-12",
        "registration_date": "2023-06-20",
        "status": "ADJOURNED",
        "stage": "Framing of Issues",
        "judge": "Hon'ble Mr. Justice A.S. Chandurkar",
        "courtroom": "Court Room 07",
        "next_hearing_date": "2026-09-15",
        "last_hearing_date": "2024-05-18",
        "summary_past": {
            "en": "The hearing scheduled for this week was postponed because the presiding judge was assigned to a special division bench.",
            "hi": "इस सप्ताह की सुनवाई टाल दी गई क्योंकि न्यायाधीश महोदय विशेष खंडपीठ में व्यस्त थे।"
        },
        "summary_next": {
            "en": "The court will formally determine the specific legal questions and issues to be tried.",
            "hi": "अदालत मामले के मुख्य कानूनी बिंदुओं (इश्यूज) को तय करेगी।"
        },
        "what_to_do": {
            "en": "You do not need to travel to court today. Contact your advocate to confirm the new September 15 date.",
            "hi": "आज कोर्ट जाने की आवश्यकता नहीं है। 15 सितंबर की नई तारीख की पुष्टि अपने वकील से करें।"
        },
        "events": [
            {
                "event_date": "2024-05-18",
                "event_type": "ADJOURNMENT",
                "purpose": "Hearing Postponed",
                "business_recorded": "Bench not available. Matter adjourned to next month.",
                "judge": "Hon'ble Mr. Justice A.S. Chandurkar"
            }
        ]
    },
    {
        "cnr": "KABC01-002194-2022",
        "case_number": "CC 312/2022",
        "court_name": "Bangalore Urban District Consumer Commission",
        "court_type": "DISTRICT_COURT",
        "state": "Karnataka",
        "district": "Bangalore Urban",
        "petitioner": "Manjunath Gowda",
        "respondent": "Apex Health Insurance Ltd.",
        "filing_date": "2022-04-10",
        "registration_date": "2022-04-15",
        "status": "DISPOSED",
        "stage": "Decreed with Costs",
        "judge": "Smt. K. Pratibha (President)",
        "courtroom": "Hall 2",
        "next_hearing_date": None,
        "last_hearing_date": "2024-01-20",
        "summary_past": {
            "en": "The case has concluded. The court accepted your claim and ordered the insurance company to pay ₹1,85,000.",
            "hi": "मामला समाप्त हो चुका है। अदालत ने बीमा कंपनी को 1,85,000 रुपये का भुगतान करने का आदेश दिया है।"
        },
        "summary_next": {
            "en": "No future hearings. The opposite party has 45 days to deposit the compensation amount.",
            "hi": "आगे कोई सुनवाई नहीं है। विपक्षी पार्टी को 45 दिनों में राशि जमा करनी होगी।"
        },
        "what_to_do": {
            "en": "Obtain a certified copy of the final judgment from the court registry to claim your settlement.",
            "hi": "भुगतान प्राप्त करने के लिए अदालत से फैसले की प्रमाणित प्रति प्राप्त करें।"
        },
        "events": [
            {
                "event_date": "2024-01-20",
                "event_type": "JUDGMENT_PRONOUNCED",
                "purpose": "Final Order Pronounced",
                "business_recorded": "Complaint allowed with costs. Insurance company directed to settle claim within 45 days.",
                "judge": "Smt. K. Pratibha (President)"
            }
        ]
    },
    {
        "cnr": "TNCH02-014589-2024",
        "case_number": "W.P. 18921/2024",
        "court_name": "High Court of Judicature at Madras",
        "court_type": "HIGH_COURT",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "petitioner": "K. Selvam & 4 Others",
        "respondent": "Tamil Nadu Electricity Board (TNEB)",
        "filing_date": "2024-05-02",
        "registration_date": "2024-05-05",
        "status": "PENDING",
        "stage": "Interim Injunction Stay",
        "judge": "Hon'ble Mr. Justice N. Anand Venkatesh",
        "courtroom": "Court Room 18",
        "next_hearing_date": "2026-09-04",
        "last_hearing_date": "2024-07-28",
        "summary_past": {
            "en": "Urgent interim stay order passed. TNEB is prohibited from disconnecting power supply until next hearing.",
            "hi": "अदालत ने तत्काल रोक लगा दी है। अगली सुनवाई तक बिजली कनेक्शन नहीं काटा जा सकता।"
        },
        "summary_next": {
            "en": "TNEB must submit their official reply and explain why the tariff was increased.",
            "hi": "विपक्षी बोर्ड को अपना आधिकारिक जवाब पेश करना होगा।"
        },
        "what_to_do": {
            "en": "Collect the interim stay order copy from your advocate and show it to the local lineman if required.",
            "hi": "वकील से अंतरिम आदेश की प्रति प्राप्त कर अपने पास रखें।"
        },
        "events": [
            {
                "event_date": "2024-07-28",
                "event_type": "ORDER_PASSED",
                "purpose": "Interim Injunction Hearing",
                "business_recorded": "Ad-interim stay granted against disconnection. Notice to respondents returnable in 4 weeks.",
                "judge": "Hon'ble Mr. Justice N. Anand Venkatesh"
            }
        ]
    },
    {
        "cnr": "UPAL01-006213-2021",
        "case_number": "OS 445/2021",
        "court_name": "Court of Civil Judge (Senior Division), Allahabad",
        "court_type": "DISTRICT_COURT",
        "state": "Uttar Pradesh",
        "district": "Prayagraj",
        "petitioner": "Harish Chandra & Brothers",
        "respondent": "State of UP & PWD Department",
        "filing_date": "2021-08-14",
        "registration_date": "2021-08-20",
        "status": "PENDING",
        "stage": "Evidence of Petitioner",
        "judge": "Sri Rajesh Kumar-IV (Civil Judge)",
        "courtroom": "Room No 4",
        "next_hearing_date": "2026-09-22",
        "last_hearing_date": "2024-04-12",
        "summary_past": {
            "en": "Plaintiff submitted list of witnesses. Cross examination pending due to state advocate adjournment request.",
            "hi": "गवाहों की सूची पेश की गई। सरकारी वकील की अर्जी पर सुनवाई स्थगित की गई।"
        },
        "summary_next": {
            "en": "Petitioner witnesses will be recorded in the witness box under oath.",
            "hi": "कटघरे में याचिकाकर्ता के गवाहों के बयान दर्ज किए जाएंगे।"
        },
        "what_to_do": {
            "en": "Ensure all two witnesses are present in court with government photo ID proofs.",
            "hi": "दोनों गवाहों को उनके आधार कार्ड / पहचान पत्र के साथ कोर्ट में उपस्थित रखें।"
        },
        "events": []
    },
    {
        "cnr": "RJJP01-009123-2023",
        "case_number": "CMA 203/2023",
        "court_name": "Rajasthan High Court Bench at Jaipur",
        "court_type": "HIGH_COURT",
        "state": "Rajasthan",
        "district": "Jaipur",
        "petitioner": "M/s Marwar Minerals & Traders",
        "respondent": "Department of Mining and Geology",
        "filing_date": "2023-09-01",
        "registration_date": "2023-09-04",
        "status": "PENDING",
        "stage": "Notice to Respondent",
        "judge": "Hon'ble Mr. Justice Mahendar Goyal",
        "courtroom": "Court Room 11",
        "next_hearing_date": "2026-09-18",
        "last_hearing_date": "2024-03-15",
        "summary_past": {
            "en": "Court admitted the petition and issued notices to the mining commissioner.",
            "hi": "अदालत ने याचिका स्वीकार कर खनन आयुक्त को नोटिस जारी किया।"
        },
        "summary_next": {
            "en": "Hearing on confirmation of mining license renewal.",
            "hi": "खनन लाइसेंस नवीनीकरण की पुष्टि पर सुनवाई होगी।"
        },
        "what_to_do": {
            "en": "Ensure process fees are paid in the court registry.",
            "hi": "कोर्ट रजिस्ट्री में प्रक्रिया शुल्क जमा होना सुनिश्चित करें।"
        },
        "events": []
    },
    {
        "cnr": "WBCC01-007812-2024",
        "case_number": "CR 1104/2024",
        "court_name": "Calcutta High Court (Appellate Side)",
        "court_type": "HIGH_COURT",
        "state": "West Bengal",
        "district": "Kolkata",
        "petitioner": "Bikash Ranjan Ghosh",
        "respondent": "State of West Bengal & CID",
        "filing_date": "2024-01-10",
        "registration_date": "2024-01-14",
        "status": "PENDING",
        "stage": "Anticipatory Bail Application",
        "judge": "Hon'ble Mr. Justice Joymalya Bagchi",
        "courtroom": "Court Room 03",
        "next_hearing_date": "2026-09-02",
        "last_hearing_date": "2024-06-18",
        "summary_past": {
            "en": "The high court granted interim anticipatory bail protection with condition to visit the police station weekly.",
            "hi": "हाईकोर्ट ने अंतरिम अग्रिम जमानत दी है, शर्त यह है कि सप्ताह में एक बार थाने में उपस्थिति देनी होगी।"
        },
        "summary_next": {
            "en": "State CID will produce the case diary and status of investigation.",
            "hi": "राज्य सीआईडी केस डायरी और जांच की प्रगति रिपोर्ट अदालत में पेश करेगी।"
        },
        "what_to_do": {
            "en": "Carry certified copy of interim bail order whenever reporting to the investigating officer.",
            "hi": "जांच अधिकारी के पास जाते समय अंतरिम जमानत आदेश की प्रति अवश्य साथ रखें।"
        },
        "events": []
    }
]

def seed_database():
    """Initializes tables and seeds the 7 realistic cases if not already present."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for c in INITIAL_CASES:
            existing = db.query(CaseModel).filter(CaseModel.cnr == c["cnr"]).first()
            if not existing:
                case_obj = CaseModel(
                    cnr=c["cnr"],
                    case_number=c["case_number"],
                    court_name=c["court_name"],
                    court_type=c["court_type"],
                    state=c["state"],
                    district=c["district"],
                    petitioner=c["petitioner"],
                    respondent=c["respondent"],
                    filing_date=c["filing_date"],
                    registration_date=c["registration_date"],
                    status=c["status"],
                    stage=c["stage"],
                    judge=c["judge"],
                    courtroom=c["courtroom"],
                    next_hearing_date=c["next_hearing_date"],
                    last_hearing_date=c["last_hearing_date"],
                    summary_past_json=json.dumps(c.get("summary_past", {})),
                    summary_next_json=json.dumps(c.get("summary_next", {})),
                    what_to_do_json=json.dumps(c.get("what_to_do", {}))
                )
                db.add(case_obj)
                db.flush()

                # Add events
                for ev in c.get("events", []):
                    event_obj = HearingEventModel(
                        case_cnr=c["cnr"],
                        event_date=ev["event_date"],
                        event_type=ev.get("event_type", "HEARING"),
                        purpose=ev.get("purpose", ""),
                        business_recorded=ev.get("business_recorded", ""),
                        judge=ev.get("judge", "")
                    )
                    db.add(event_obj)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
