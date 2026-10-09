import http from 'node:http';
import { 
  initDatabase, 
  searchCases, 
  getCaseByCnr, 
  createCase, 
  getReminders, 
  createReminders, 
  cancelReminder,
  logIvrCall,
  logAudit,
  db
} from './db.js';
import {
  extractNoticeWithAi,
  simplifyLegalOrderWithAi,
  answerCaseQuestionWithAi,
  processVoiceQueryWithAi,
  tamilConversationalAssist,
  getRateLimitStatus
} from './ai.js';

const PORT = process.env.PORT || 8000;

// Initialize SQLite database & seed 7 cases
initDatabase();
console.log('✅ SQLite Database initialized at jurislink.db (tables: cases, hearing_events, reminders, ivr_call_logs, audit_logs)');
console.log('🤖 Groq AI Engine loaded (qwen/qwen3.8-27b with failover & rate limit protection)');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // 1. Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      database: 'SQLite (node:sqlite)',
      tables: ['cases', 'hearing_events', 'reminders', 'ivr_call_logs', 'audit_logs'],
      version: '1.0.0'
    }));
    return;
  }

  // 2. Cases: Search or List
  if (pathname === '/api/cases' && req.method === 'GET') {
    const partyName = url.searchParams.get('partyName');
    const caseNumber = url.searchParams.get('caseNumber');
    const courtName = url.searchParams.get('courtName');

    const results = searchCases({ partyName, caseNumber, courtName });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // 3. Cases: Lookup by CNR
  if (pathname.startsWith('/api/cases/') && req.method === 'GET') {
    const cnr = decodeURIComponent(pathname.replace('/api/cases/', ''));
    const caseObj = getCaseByCnr(cnr);
    if (!caseObj) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Case record '${cnr}' not found in database` }));
      return;
    }
    logAudit({
      action: 'CASE_LOOKUP',
      entity: 'Case',
      entityId: caseObj.cnr,
      details: `Lookup for ${caseObj.caseNumber}`
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(caseObj));
    return;
  }

  // 4. Cases: Create / Sync
  if (pathname === '/api/cases' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    if (!body.cnr || !body.caseNumber) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'CNR and caseNumber are required' }));
      return;
    }
    const created = createCase(body);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(created));
    return;
  }

  // 5. Reminders: List
  if (pathname === '/api/reminders' && req.method === 'GET') {
    const phone = url.searchParams.get('phone');
    const cnr = url.searchParams.get('cnr');
    const reminders = getReminders({ phone, cnr });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(reminders));
    return;
  }

  // 6. Reminders: Register proactive reminders
  if (pathname === '/api/reminders' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    if (!body.caseCnr || !body.userPhone || !body.hearingDate) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'caseCnr, userPhone, and hearingDate are required' }));
      return;
    }
    const scheduled = createReminders(body);
    logAudit({
      action: 'REMINDERS_REGISTERED',
      entity: 'Reminder',
      entityId: body.caseCnr,
      details: `Scheduled ${scheduled.length} proactive alerts for ${body.userPhone}`
    });
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scheduled));
    return;
  }

  // 7. Reminders: Cancel
  if (pathname.startsWith('/api/reminders/') && pathname.endsWith('/cancel') && req.method === 'PATCH') {
    const parts = pathname.split('/');
    const id = parts[3];
    const result = cancelReminder(id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 8. IVR: Twilio Webhook (TwiML XML)
  if (pathname === '/api/ivr/twilio' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const digits = body.Digits || '';
    logIvrCall({
      callSid: body.CallSid || 'SIM-TWILIO',
      callerNumber: body.From || '1800-JURIS-LINK',
      digits,
      step: digits ? 'DIGIT_PROCESSED' : 'WELCOME'
    });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    if (!digits) {
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/ivr/twilio" method="POST">
    <Say language="hi-IN">न्याय सेतु में आपका स्वागत है। हिंदी के लिए 1 दबाएं।</Say>
    <Say language="en-IN">Welcome to Jurislink. For English, press 2.</Say>
  </Gather>
</Response>`);
    } else {
      res.end(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN">You selected option ${digits}. Next hearing is September 8 at Court Room 14.</Say>
</Response>`);
    }
    return;
  }

  // 9. IVR: Exotel Webhook
  if (pathname === '/api/ivr/exotel' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    logIvrCall({
      callSid: body.CallSid || 'SIM-EXOTEL',
      callerNumber: body.From || 'UNKNOWN',
      digits: body.Digits || '',
      step: 'EXOTEL_FLOW'
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      action: 'play_and_gather',
      prompt: 'Welcome to Jurislink Legal Helpline. Press 1 for Hindi, 2 for English.',
      nalsa_helpline: '15100'
    }));
    return;
  }

  // 10. IVR: Call logs
  if (pathname === '/api/ivr/logs' && req.method === 'GET') {
    const logs = db.prepare("SELECT * FROM ivr_call_logs ORDER BY timestamp DESC LIMIT 20").all();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs));
    return;
  }

  // 11. AI Telemetry & Rate Limit Status
  if (pathname === '/api/ai/status' && req.method === 'GET') {
    const status = getRateLimitStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
    return;
  }

  // 12. AI Document & Notice Scanner Extraction (Groq)
  if (pathname === '/api/ai/extract-notice' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const result = await extractNoticeWithAi(body.ocrText || '');
    
    // If case has valid CNR or caseNumber, check if it's already in DB, or auto-sync
    if (result.extractedCnr) {
      const existing = getCaseByCnr(result.extractedCnr);
      if (existing) {
        result.existingCase = existing;
      }
    }

    logAudit({
      action: 'AI_NOTICE_EXTRACTED',
      entity: 'Notice',
      entityId: result.extractedCnr || result.extractedCaseNumber || 'UNKNOWN',
      details: `AI extracted case: ${result.extractedCaseNumber || result.extractedCnr} via ${result.aiModelUsed || 'Groq'}`
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 13. AI Legal Order Text Simplification (Groq)
  if (pathname === '/api/nlp/simplify' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const simplified = await simplifyLegalOrderWithAi(
      body.rawOrderText || '',
      body.courtName || 'High Court',
      body.caseStatus || 'PENDING'
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(simplified));
    return;
  }

  // 14. AI Case Legal Assistant Q&A
  if (pathname === '/api/ai/ask-case' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    if (!body.caseData || !body.question) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'caseData and question are required' }));
      return;
    }

    const answer = await answerCaseQuestionWithAi(body.caseData, body.question, body.language || 'en');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(answer));
    return;
  }

  // 15. AI Voice Query Processor
  if (pathname === '/api/ai/voice-query' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const allCases = searchCases({});
    const response = await processVoiceQueryWithAi(body.transcript || '', body.language || 'hi', allCases);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  // 16. Tamil Live Conversational Voice Assistant
  if (pathname === '/api/ai/tamil-assist' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    if (!body.message) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'message is required' }));
      return;
    }
    const allCases = searchCases({});
    const response = await tamilConversationalAssist(
      body.message,
      body.history || [],
      body.language || 'ta',
      allCases
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    return;
  }

  // 17. High-Fidelity Indic Audio Streamer (Tamil, Hindi, English)
  if (pathname === '/api/ai/tts-audio' && req.method === 'GET') {
    const text = url.searchParams.get('text');
    const lang = url.searchParams.get('lang') || 'ta';
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'text query parameter is required' }));
      return;
    }

    try {
      // Clean spoken string of punctuation and URLs
      const cleanText = text
        .replace(/[*#_~`>•-]/g, ' ')
        .replace(/\([A-Za-z0-9\s]+\)/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 300);

      const targetLang = lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en-IN';
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
      
      const upstreamRes = await fetch(ttsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      if (!upstreamRes.ok) {
        throw new Error(`Upstream TTS returned ${upstreamRes.status}`);
      }

      const audioBuffer = await upstreamRes.arrayBuffer();
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(Buffer.from(audioBuffer));
      return;
    } catch (err) {
      console.warn('[TTS Audio Stream Error]', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'TTS audio could not be generated', details: err.message }));
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Jurislink Backend Server & Database active at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Cases API   : http://localhost:${PORT}/api/cases`);
});
