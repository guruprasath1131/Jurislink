import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../jurislink.db');

let sqliteMod = null;
try {
  sqliteMod = await import('node:sqlite');
} catch {
  console.warn('[SQLite] node:sqlite module not present in this runtime');
}

let dbInstance = null;
if (sqliteMod?.DatabaseSync) {
  try {
    dbInstance = new sqliteMod.DatabaseSync(DB_PATH);
  } catch (err1) {
    try {
      dbInstance = new sqliteMod.DatabaseSync(':memory:');
    } catch (err2) {
      console.warn('[SQLite] Failed to initialize in-memory SQLite:', err2.message);
    }
  }
}

export const db = dbInstance;

// Initialize Tables
export function initDatabase() {
  if (!db) {
    console.warn('[SQLite] Skipping initDatabase, db instance unavailable');
    return;
  }
  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      cnr TEXT PRIMARY KEY,
      case_number TEXT NOT NULL,
      court_name TEXT NOT NULL,
      court_type TEXT DEFAULT 'HIGH_COURT',
      state TEXT DEFAULT '',
      district TEXT DEFAULT '',
      petitioner TEXT NOT NULL,
      respondent TEXT NOT NULL,
      filing_date TEXT DEFAULT '',
      registration_date TEXT DEFAULT '',
      status TEXT DEFAULT 'PENDING',
      stage TEXT DEFAULT '',
      judge TEXT DEFAULT '',
      courtroom TEXT DEFAULT '',
      next_hearing_date TEXT,
      last_hearing_date TEXT,
      summary_past_json TEXT DEFAULT '{}',
      summary_next_json TEXT DEFAULT '{}',
      what_to_do_json TEXT DEFAULT '{}',
      qr_code_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hearing_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_cnr TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_type TEXT DEFAULT 'HEARING',
      purpose TEXT DEFAULT '',
      business_recorded TEXT DEFAULT '',
      judge TEXT DEFAULT '',
      order_pdf_url TEXT,
      simplified_summary_json TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (case_cnr) REFERENCES cases(cnr) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      case_cnr TEXT NOT NULL,
      user_phone TEXT NOT NULL,
      hearing_date TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      reminder_type TEXT DEFAULT 'HEARING_REMINDER',
      status TEXT DEFAULT 'PENDING',
      message TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (case_cnr) REFERENCES cases(cnr) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ivr_call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      call_sid TEXT,
      caller_number TEXT DEFAULT '',
      selected_language TEXT DEFAULT 'en',
      last_step TEXT DEFAULT '',
      digits_pressed TEXT DEFAULT '',
      duration_seconds INTEGER DEFAULT 0,
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT DEFAULT '',
      entity_id TEXT DEFAULT '',
      details TEXT DEFAULT '',
      client_ip TEXT DEFAULT '',
      timestamp TEXT DEFAULT (datetime('now'))
    );
  `);

    seedInitialCases();
  } catch (err) {
    console.warn('[SQLite] initDatabase error:', err.message);
  }
}

const SEED_CASES = [
  {
    cnr: "DLHC01-008472-2024",
    case_number: "WP(C) 1402/2024",
    court_name: "High Court of Delhi at New Delhi",
    court_type: "HIGH_COURT",
    state: "Delhi",
    district: "New Delhi",
    petitioner: "Rameshwar Dayal (Farmer Welfare Union)",
    respondent: "Delhi Development Authority & Ors.",
    filing_date: "2024-02-15",
    registration_date: "2024-02-18",
    status: "PENDING",
    stage: "Final Arguments",
    judge: "Hon'ble Mr. Justice R.K. Sharma & Hon'ble Ms. Justice P. Roy",
    courtroom: "Court Room 14",
    next_hearing_date: "2026-09-08",
    last_hearing_date: "2024-07-22",
    summary_past: {
      en: "The court heard initial arguments regarding land compensation and directed government authorities to submit land records.",
      hi: "अदालत ने ज़मीन के मुआवजे पर प्रारंभिक दलीलें सुनीं और अधिकारियों को ज़मीन का रिकॉर्ड जमा करने का निर्देश दिया।"
    },
    summary_next: {
      en: "Final arguments from both lawyers will take place. The judge will decide on the stay and compensation amount.",
      hi: "दोनों पक्षों के वकीलों की अंतिम बहस होगी। जज साहब मुआवजे की राशि और रोक पर फैसला सुनाएंगे।"
    },
    what_to_do: {
      en: "Be present at Court Room 14 by 10:00 AM with your identity card and advocate.",
      hi: "सुबह 10:00 बजे अपने पहचान पत्र और वकील के साथ कोर्ट रूम 14 में उपस्थित रहें।"
    },
    events: [
      {
        event_date: "2024-03-10",
        event_type: "ORDER_PASSED",
        purpose: "First Admission & Notice",
        business_recorded: "Notice issued. Status quo to be maintained regarding possession till next hearing.",
        judge: "Hon'ble Mr. Justice R.K. Sharma"
      },
      {
        event_date: "2024-07-22",
        event_type: "HEARING",
        purpose: "Counter Affidavit Filed",
        business_recorded: "Counter affidavit taken on record. Relist for final arguments.",
        judge: "Hon'ble Mr. Justice R.K. Sharma"
      }
    ]
  },
  {
    cnr: "MCHC01-003921-2023",
    case_number: "FA 589/2023",
    court_name: "High Court of Judicature at Bombay",
    court_type: "HIGH_COURT",
    state: "Maharashtra",
    district: "Mumbai",
    petitioner: "Sunita Suresh Shinde",
    respondent: "Maharashtra State Electricity Distribution Co.",
    filing_date: "2023-06-12",
    registration_date: "2023-06-20",
    status: "ADJOURNED",
    stage: "Framing of Issues",
    judge: "Hon'ble Mr. Justice A.S. Chandurkar",
    courtroom: "Court Room 07",
    next_hearing_date: "2026-09-15",
    last_hearing_date: "2024-05-18",
    summary_past: {
      en: "The hearing scheduled for this week was postponed because the presiding judge was assigned to a special division bench.",
      hi: "इस सप्ताह की सुनवाई टाल दी गई क्योंकि न्यायाधीश महोदय विशेष खंडपीठ में व्यस्त थे।"
    },
    summary_next: {
      en: "The court will formally determine the specific legal questions and issues to be tried.",
      hi: "अदालत मामले के मुख्य कानूनी बिंदुओं को तय करेगी।"
    },
    what_to_do: {
      en: "You do not need to travel to court today. Contact your advocate to confirm the new September 15 date.",
      hi: "आज कोर्ट जाने की आवश्यकता नहीं है। 15 सितंबर की नई तारीख की पुष्टि अपने वकील से करें।"
    },
    events: []
  },
  {
    cnr: "KABC01-002194-2022",
    case_number: "CC 312/2022",
    court_name: "Bangalore Urban District Consumer Commission",
    court_type: "DISTRICT_COURT",
    state: "Karnataka",
    district: "Bangalore Urban",
    petitioner: "Manjunath Gowda",
    respondent: "Apex Health Insurance Ltd.",
    filing_date: "2022-04-10",
    registration_date: "2022-04-15",
    status: "DISPOSED",
    stage: "Decreed with Costs",
    judge: "Smt. K. Pratibha (President)",
    courtroom: "Hall 2",
    next_hearing_date: null,
    last_hearing_date: "2024-01-20",
    summary_past: {
      en: "The case has concluded. The court accepted your claim and ordered the insurance company to pay ₹1,85,000.",
      hi: "मामला समाप्त हो चुका है। अदालत ने बीमा कंपनी को 1,85,000 रुपये का भुगतान करने का आदेश दिया है।"
    },
    summary_next: {
      en: "No future hearings. The opposite party has 45 days to deposit the compensation amount.",
      hi: "आगे कोई सुनवाई नहीं है। विपक्षी पार्टी को 45 दिनों में राशि जमा करनी होगी।"
    },
    what_to_do: {
      en: "Obtain a certified copy of the final judgment from the court registry to claim your settlement.",
      hi: "भुगतान प्राप्त करने के लिए अदालत से फैसले की प्रमाणित प्रति प्राप्त करें।"
    },
    events: []
  },
  {
    cnr: "TNCH02-014589-2024",
    case_number: "W.P. 18921/2024",
    court_name: "High Court of Judicature at Madras",
    court_type: "HIGH_COURT",
    state: "Tamil Nadu",
    district: "Chennai",
    petitioner: "K. Selvam & 4 Others",
    respondent: "Tamil Nadu Electricity Board (TNEB)",
    filing_date: "2024-05-02",
    registration_date: "2024-05-05",
    status: "PENDING",
    stage: "Interim Injunction Stay",
    judge: "Hon'ble Mr. Justice N. Anand Venkatesh",
    courtroom: "Court Room 18",
    next_hearing_date: "2026-09-04",
    last_hearing_date: "2024-07-28",
    summary_past: {
      en: "Urgent interim stay order passed. TNEB is prohibited from disconnecting power supply until next hearing.",
      hi: "अदालत ने तत्काल रोक लगा दी है। अगली सुनवाई तक बिजली कनेक्शन नहीं काटा जा सकता।"
    },
    summary_next: {
      en: "TNEB must submit their official reply and explain why the tariff was increased.",
      hi: "विपक्षी बोर्ड को अपना आधिकारिक जवाब पेश करना होगा।"
    },
    what_to_do: {
      en: "Collect the interim stay order copy from your advocate and show it to the local lineman if required.",
      hi: "वकील से अंतरिम आदेश की प्रति प्राप्त कर अपने पास रखें।"
    },
    events: []
  },
  {
    cnr: "UPAL01-006213-2021",
    case_number: "OS 445/2021",
    court_name: "Court of Civil Judge (Senior Division), Allahabad",
    court_type: "DISTRICT_COURT",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    petitioner: "Harish Chandra & Brothers",
    respondent: "State of UP & PWD Department",
    filing_date: "2021-08-14",
    registration_date: "2021-08-20",
    status: "PENDING",
    stage: "Evidence of Petitioner",
    judge: "Sri Rajesh Kumar-IV (Civil Judge)",
    courtroom: "Room No 4",
    next_hearing_date: "2026-09-22",
    last_hearing_date: "2024-04-12",
    summary_past: {
      en: "Plaintiff submitted list of witnesses. Cross examination pending due to state advocate adjournment request.",
      hi: "गवाहों की सूची पेश की गई।"
    },
    summary_next: {
      en: "Petitioner witnesses will be recorded in the witness box under oath.",
      hi: "कटघरे में याचिकाकर्ता के गवाहों के बयान दर्ज किए जाएंगे।"
    },
    what_to_do: {
      en: "Ensure all two witnesses are present in court with government photo ID proofs.",
      hi: "दोनों गवाहों को उनके आधार कार्ड / पहचान पत्र के साथ कोर्ट में उपस्थित रखें।"
    },
    events: []
  },
  {
    cnr: "RJJP01-009123-2023",
    case_number: "CMA 203/2023",
    court_name: "Rajasthan High Court Bench at Jaipur",
    court_type: "HIGH_COURT",
    state: "Rajasthan",
    district: "Jaipur",
    petitioner: "M/s Marwar Minerals & Traders",
    respondent: "Department of Mining and Geology",
    filing_date: "2023-09-01",
    registration_date: "2023-09-04",
    status: "PENDING",
    stage: "Notice to Respondent",
    judge: "Hon'ble Mr. Justice Mahendar Goyal",
    courtroom: "Court Room 11",
    next_hearing_date: "2026-09-18",
    last_hearing_date: "2024-03-15",
    summary_past: {
      en: "Court admitted the petition and issued notices to the mining commissioner.",
      hi: "अदालत ने याचिका स्वीकार कर खनन आयुक्त को नोटिस जारी किया।"
    },
    summary_next: {
      en: "Hearing on confirmation of mining license renewal.",
      hi: "खनन लाइसेंस नवीनीकरण की पुष्टि पर सुनवाई होगी।"
    },
    what_to_do: {
      en: "Ensure process fees are paid in the court registry.",
      hi: "कोर्ट रजिस्ट्री में प्रक्रिया शुल्क जमा होना सुनिश्चित करें।"
    },
    events: []
  },
  {
    cnr: "WBCC01-007812-2024",
    case_number: "CR 1104/2024",
    court_name: "Calcutta High Court (Appellate Side)",
    court_type: "HIGH_COURT",
    state: "West Bengal",
    district: "Kolkata",
    petitioner: "Bikash Ranjan Ghosh",
    respondent: "State of West Bengal & CID",
    filing_date: "2024-01-10",
    registration_date: "2024-01-14",
    status: "PENDING",
    stage: "Anticipatory Bail Application",
    judge: "Hon'ble Mr. Justice Joymalya Bagchi",
    courtroom: "Court Room 03",
    next_hearing_date: "2026-09-02",
    last_hearing_date: "2024-06-18",
    summary_past: {
      en: "The high court granted interim anticipatory bail protection with condition to visit the police station weekly.",
      hi: "हाईकोर्ट ने अंतरिम अग्रिम जमानत दी है।"
    },
    summary_next: {
      en: "State CID will produce the case diary and status of investigation.",
      hi: "राज्य सीआईडी केस डायरी पेश करेगी।"
    },
    what_to_do: {
      en: "Carry certified copy of interim bail order whenever reporting to the investigating officer.",
      hi: "जांच अधिकारी के पास जाते समय अंतरिम जमानत आदेश की प्रति अवश्य साथ रखें।"
    },
    events: []
  }
];

function seedInitialCases() {
  const countRow = db.prepare("SELECT count(*) as cnt FROM cases").get();
  if (countRow && countRow.cnt > 0) return;

  const insertCase = db.prepare(`
    INSERT INTO cases (
      cnr, case_number, court_name, court_type, state, district,
      petitioner, respondent, filing_date, registration_date, status,
      stage, judge, courtroom, next_hearing_date, last_hearing_date,
      summary_past_json, summary_next_json, what_to_do_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO hearing_events (
      case_cnr, event_date, event_type, purpose, business_recorded, judge
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const c of SEED_CASES) {
    insertCase.run(
      c.cnr,
      c.case_number,
      c.court_name,
      c.court_type,
      c.state,
      c.district,
      c.petitioner,
      c.respondent,
      c.filing_date,
      c.registration_date,
      c.status,
      c.stage,
      c.judge,
      c.courtroom,
      c.next_hearing_date,
      c.last_hearing_date,
      JSON.stringify(c.summary_past || {}),
      JSON.stringify(c.summary_next || {}),
      JSON.stringify(c.what_to_do || {})
    );

    for (const ev of (c.events || [])) {
      insertEvent.run(
        c.cnr,
        ev.event_date,
        ev.event_type || 'HEARING',
        ev.purpose || '',
        ev.business_recorded || '',
        ev.judge || ''
      );
    }
  }
}

export function searchCases({ partyName, caseNumber, courtName }) {
  let sql = "SELECT * FROM cases WHERE 1=1";
  const params = [];

  if (partyName) {
    sql += " AND (petitioner LIKE ? OR respondent LIKE ?)";
    const term = `%${partyName.trim()}%`;
    params.push(term, term);
  }
  if (caseNumber) {
    sql += " AND case_number LIKE ?";
    params.push(`%${caseNumber.trim()}%`);
  }
  if (courtName) {
    sql += " AND court_name LIKE ?";
    params.push(`%${courtName.trim()}%`);
  }

  sql += " LIMIT 50";
  const rows = db.prepare(sql).all(...params);
  return rows.map(r => formatCaseRow(r));
}

export function getCaseByCnr(cnr) {
  const cleaned = cnr.trim().toUpperCase();
  let row = db.prepare("SELECT * FROM cases WHERE cnr = ?").get(cleaned);

  if (!row) {
    // Try without dashes
    const noDashes = cleaned.replace(/-/g, '');
    const all = db.prepare("SELECT * FROM cases").all();
    row = all.find(c => c.cnr.replace(/-/g, '').toUpperCase() === noDashes);
  }

  if (!row) return null;

  const events = db.prepare("SELECT * FROM hearing_events WHERE case_cnr = ? ORDER BY event_date ASC").all(row.cnr);
  return formatCaseRow(row, events);
}

export function createCase(data) {
  const insertCase = db.prepare(`
    INSERT INTO cases (
      cnr, case_number, court_name, court_type, state, district,
      petitioner, respondent, filing_date, registration_date, status,
      stage, judge, courtroom, next_hearing_date, last_hearing_date,
      summary_past_json, summary_next_json, what_to_do_json, qr_code_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCase.run(
    data.cnr,
    data.caseNumber,
    data.courtName,
    data.courtType || 'HIGH_COURT',
    data.state || '',
    data.district || '',
    data.petitioner,
    data.respondent,
    data.filingDate || '',
    data.registrationDate || '',
    data.status || 'PENDING',
    data.stage || '',
    data.judge || '',
    data.courtroom || '',
    data.nextHearingDate || null,
    data.lastHearingDate || null,
    JSON.stringify(data.summaryPast || {}),
    JSON.stringify(data.summaryNext || {}),
    JSON.stringify(data.whatToDo || {}),
    data.qrCodeData || null
  );

  return getCaseByCnr(data.cnr);
}

export function getReminders({ phone, cnr }) {
  let sql = "SELECT * FROM reminders WHERE 1=1";
  const params = [];
  if (phone) {
    sql += " AND user_phone = ?";
    params.push(phone.trim());
  }
  if (cnr) {
    sql += " AND case_cnr = ?";
    params.push(cnr.trim());
  }
  sql += " ORDER BY scheduled_date ASC";
  const rows = db.prepare(sql).all(...params);
  return rows.map(r => ({
    id: r.id,
    caseCnr: r.case_cnr,
    userPhone: r.user_phone,
    hearingDate: r.hearing_date,
    scheduledDate: r.scheduled_date,
    type: r.reminder_type,
    status: r.status,
    message: r.message,
    createdAt: r.created_at
  }));
}

export function createReminders({ caseCnr, userPhone, hearingDate }) {
  const caseObj = getCaseByCnr(caseCnr);
  const courtInfo = caseObj ? caseObj.courtName : "the court";
  const caseNum = caseObj ? caseObj.caseNumber : caseCnr;

  // Cancel old pending reminders for this case if hearing date rescheduled
  db.prepare(`
    UPDATE reminders SET status = 'CANCELLED' 
    WHERE case_cnr = ? AND user_phone = ? AND status = 'PENDING' AND hearing_date != ?
  `).run(caseCnr, userPhone, hearingDate);

  const hearingDt = new Date(hearingDate);
  const intervals = [
    { days: 7, template: `Reminder: Your case ${caseNum} is scheduled in 7 days on ${hearingDate} at ${courtInfo}.` },
    { days: 3, template: `Action needed: 3 days until hearing for ${caseNum} on ${hearingDate}. Check documents.` },
    { days: 1, template: `Urgent: Court hearing tomorrow for ${caseNum} on ${hearingDate}. Meet advocate at ${courtInfo}.` },
    { days: 0, template: `Today is your hearing date for ${caseNum}. Please arrive by 10:00 AM.` }
  ];

  const insertRem = db.prepare(`
    INSERT INTO reminders (id, case_cnr, user_phone, hearing_date, scheduled_date, reminder_type, status, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const created = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (const item of intervals) {
    const trigger = new Date(hearingDt);
    trigger.setDate(trigger.getDate() - item.days);
    const triggerStr = trigger.toISOString().split('T')[0];
    const status = triggerStr < todayStr ? 'SENT' : 'PENDING';
    const id = `REM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    insertRem.run(id, caseCnr, userPhone, hearingDate, triggerStr, 'HEARING_REMINDER', status, item.template);
    created.push({
      id,
      caseCnr,
      userPhone,
      hearingDate,
      scheduledDate: triggerStr,
      type: 'HEARING_REMINDER',
      status,
      message: item.template
    });
  }

  return created;
}

export function cancelReminder(id) {
  db.prepare("UPDATE reminders SET status = 'CANCELLED' WHERE id = ?").run(id);
  return { message: "Reminder cancelled successfully", id };
}

export function logIvrCall({ callSid, callerNumber, digits, step, language, duration }) {
  db.prepare(`
    INSERT INTO ivr_call_logs (call_sid, caller_number, selected_language, last_step, digits_pressed, duration_seconds)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(callSid || 'SIM', callerNumber || 'UNKNOWN', language || 'en', step || 'MENU', digits || '', duration || 0);
}

export function logAudit({ action, entity, entityId, details, clientIp }) {
  db.prepare(`
    INSERT INTO audit_logs (action, entity, entity_id, details, client_ip)
    VALUES (?, ?, ?, ?, ?)
  `).run(action, entity || '', entityId || '', details || '', clientIp || '');
}

function formatCaseRow(row, events = []) {
  const safeEvents = Array.isArray(events) ? events : [];
  return {
    cnr: row.cnr,
    caseNumber: row.case_number,
    case_number: row.case_number,
    courtName: row.court_name,
    court_name: row.court_name,
    courtType: row.court_type,
    court_type: row.court_type,
    state: row.state,
    district: row.district,
    petitioner: row.petitioner,
    respondent: row.respondent,
    filingDate: row.filing_date,
    registrationDate: row.registration_date,
    status: row.status,
    stage: row.stage,
    judge: row.judge,
    courtroom: row.courtroom,
    nextHearingDate: row.next_hearing_date,
    next_hearing_date: row.next_hearing_date,
    lastHearingDate: row.last_hearing_date,
    last_hearing_date: row.last_hearing_date,
    summaryPast: JSON.parse(row.summary_past_json || '{}'),
    summaryNext: JSON.parse(row.summary_next_json || '{}'),
    whatToDo: JSON.parse(row.what_to_do_json || '{}'),
    qrCodeData: row.qr_code_data,
    events: safeEvents.map(e => ({
      id: String(e.id),
      date: e.event_date,
      type: e.event_type,
      purpose: e.purpose,
      businessRecorded: e.business_recorded,
      judge: e.judge,
      orderPdfUrl: e.order_pdf_url,
      simplifiedSummary: JSON.parse(e.simplified_summary_json || '{}')
    }))
  };
}
