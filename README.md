# Jurislink (न्याय सेतु)
### Multilingual, Voice-First Legal Case Accessibility Platform for India

Jurislink is an accessibility layer built over authentic **eCourts Services** and **National Judicial Data Grid (NJDG)** public case records in India. It is specially designed for **low-literacy citizens, non-English speakers, and 2G feature-phone users**.

> [!NOTE]
> **Core Principle**: Jurislink does NOT replace the official court system, modify authoritative legal facts, or provide legal advice. It transforms dense legal jargon into clear, 5th-grade regional language explanations with spoken audio narration and actionable next steps.

---

## 🏛️ The Core Principle: 4-Step Hierarchy

Every case presentation in Jurislink strictly prioritizes clarity in the following sequence:

```
  1. ⚡ WHAT HAPPENED?
     Plain-language summary of past proceedings (5th-grade reading level)
     
  2. 🔮 WHAT HAPPENS NEXT?
     Actionable explanation of upcoming stage (Arguments, Evidence, Bail, etc.)
     
  3. 📅 WHEN?
     Next hearing date, time, and days remaining countdown badge
     
  4. 📍 WHERE?
     Court room number, bench, judge name, and court complex address
     
  👉 WHAT YOU NEED TO DO
     Clear practical instructions (e.g. bring ID card, meet advocate by 10 AM)
```

---

## 🚀 Key Features

### 1. 🇮🇳 Multilingual Indian Language Engine
- **8 Indian Languages Supported**: हिन्दी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu), ಕನ್ನಡ (Kannada), मराठी (Marathi), বাংলা (Bengali), ગુજરાતી (Gujarati), and English.
- Real-time localized UI switching with Noto Sans regional typography.
- High-contrast visual mode with accessibility standards for low-vision users.

### 2. 🔊 Voice-First Audio Narration
- Text-to-Speech (TTS) engine with regional Indian language voice synthesis.
- Large tactile audio play/stop button with animated soundwave visualizer on every case card, event, and section.
- Spoken voice queries with speech recognition for hands-free lookup.

### 3. 📷 Notice Photo Scanner & OCR
- Take camera photos or upload summons and court orders.
- Image pre-processing: grayscale conversion, contrast enhancement, and binarization thresholding for folded/poorly lit notices.
- Regex extraction for **16-digit CNR numbers**, case numbers, court names, hearing dates, and parties.
- **Mandatory User Confirmation Modal**: Confirms extracted data before lookup; flags low-confidence readings (e.g., blurry paper) with clear warnings.

### 4. 📱 2G Feature-Phone IVR Simulator (`1800-JURIS-LINK`)
- Interactive vintage handset with tactile 3x4 dialpad, LCD screen, DTMF audio keytones, and live spoken voice responses.
- Simulates toll-free dial-in (`1800-587-4754`):
  - Press `1` for Hindi, `2` for English, `3` for Tamil, etc.
  - Press `1` to hear saved case status (What Happened -> What Happens Next -> When -> Where).
  - Press `2` to enter CNR / case number.
  - Press `3` for proactive SMS hearing reminders.
  - Press `4` for NALSA free legal aid helpline (`15100`).
- **PBX Webhook Inspector**: Generates standard **Twilio TwiML XML** and **Exotel JSON** payloads.

### 5. 🔔 Proactive SMS Hearing Reminders
- Automatic schedule computation for 7 days, 3 days, 1 day before hearing, and morning of hearing.
- **Adjournment & Reschedule Change Detection**: Auto-cancels outdated pending alerts and dispatches a "Hearing Rescheduled" SMS without duplicate notifications.

### 6. 🧪 7 Realistic Synthetic Demo Scenarios
1. 🟢 **Upcoming Hearing** (`DLHC01-008472-2024`): Land dispute in Delhi High Court with clear next hearing date.
2. 🟡 **Adjourned Case** (`MCHC01-003921-2023`): Bombay High Court civil appeal postponed due to bench change.
3. 🔵 **Completed / Disposed Case** (`KABC01-002194-2022`): Consumer court decree with ₹1.85L payout & 9% interest.
4. 🟣 **New Order Issued** (`TNCH02-014589-2024`): Madras High Court urgent interim stay on electricity disconnection.
5. 🟠 **Stale Data** (`UPAL01-006213-2021`): Allahabad District Court partition suit with 45-day sync delay badge.
6. 🔴 **Server Down (Offline Mode)** (`RJJP01-009123-2023`): Graceful cached offline fallback during eCourts maintenance.
7. ⚪ **OCR Uncertainty** (`WBCC01-007812-2024`): Blurry notice with 62% confidence requiring user confirmation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, TypeScript, Lucide Icons, Canvas API, Web Speech Synthesis API.
- **Backend**: Python 3.11 with FastAPI (Asynchronous REST API, Swagger/OpenAPI docs at `/docs`).
- **Database**: PostgreSQL 16 (production container) with SQLAlchemy ORM and automatic table creation & demo seed data. Zero-config SQLite fallback for local developer runs.
- **OCR Engine**: Tesseract.js with adaptive binarization pre-processing.
- **QR Engine**: jsQR with eCourts NJDG URL validator.
- **Styling**: Vanilla CSS Design System with accessible tokens, micro-animations, and high-contrast theme.
- **Telephony & Webhooks**: Exotel & Twilio TwiML compatible webhook generator (`/api/ivr/twilio` & `/api/ivr/exotel`).
- **Testing**: Node.js built-in test runner (`node --test`).
- **Containerization**: Multi-container Docker & Docker Compose (`db`, `backend`, `jurislink-web`).

---

## 💻 Quick Start & Setup

### Prerequisites
- Node.js `v18+` / `v20+` / `v24+`
- Python `3.10+` (optional for local FastAPI run without Docker)
- Docker & Docker Compose (for complete multi-service deployment)

### ⚡ One-Click Run (Windows)
Double-click:
```text
run_jurislink.bat
```
*(Automatically verifies dependencies, boots the backend if Python is present, and launches the web platform at `http://localhost:3000`)*

---

### 1. Run Development Server Locally
```bash
# Install frontend dependencies
npm install

# Start Vite dev server (runs on port 3000)
npm run dev
```

Visit: `http://localhost:3000`

### 2. Run FastAPI Backend Locally (Optional)
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Documentation: `http://localhost:8000/docs`

### 3. Run Automated Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

### 5. Run Full Stack with Docker Compose (PostgreSQL + FastAPI + Web UI)
```bash
docker-compose up --build -d
```
- Frontend UI: `http://localhost:3000`
- FastAPI API & Swagger Docs: `http://localhost:8000/docs`
- PostgreSQL 16: `localhost:5432` (`jurislink_db`)

---

## 🔒 Security & Privacy

- **Phone OTP Authentication**: Safe session management without exposing keys in the client.
- **Zero Hallucination**: AI explanations never alter dates, CNR, case numbers, or judicial facts.
- **Low Confidence Fallback**: When OCR or order text is ambiguous, Jurislink explicitly marks the document as unverified and directs users to official records.
- **Sanitized Uploads**: Image MIME validation and file size restrictions.

---

## 📜 Legal Notice

Jurislink is an accessibility tool created to bridge the legal language and literacy divide. Authoritative court orders and case records published by the respective High Courts and District Courts via eCourts/NJDG remain the sole legally binding source of truth.
