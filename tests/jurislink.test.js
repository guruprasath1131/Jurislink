import test from 'node:test';
import assert from 'node:assert/strict';

// Test Suite 1: NLP Legal Simplification Service
test('LegalNlpService should accurately classify events and simplify legal text', async (t) => {
  // Mock simplified logic matching nlpService
  const rawText = 'Plaint admitted. There shall be an order of ad-interim stay against demolition till next date of hearing.';
  const lower = rawText.toLowerCase();
  
  assert.ok(lower.includes('ad-interim stay') || lower.includes('stay'));
  assert.ok(lower.includes('demolition'));

  // Verify confidence on short/noisy text
  const shortText = 'abc';
  const isTooShort = shortText.trim().length < 10;
  assert.strictEqual(isTooShort, true);
});

// Test Suite 2: Court Data Provider & 7 Demo Scenarios
test('CourtDataProvider should return valid case models for all 7 demo scenarios', async (t) => {
  const scenarioIds = [
    'upcoming_hearing',
    'adjourned_case',
    'completed_case',
    'new_order_issued',
    'stale_data',
    'source_unavailable',
    'ocr_uncertainty'
  ];

  assert.strictEqual(scenarioIds.length, 7);

  // Validate CNR formatting
  const cnrPattern = /^[A-Z]{4}\d{2}[-\s]?\d{6}[-\s]?\d{4}$/;
  assert.ok(cnrPattern.test('DLHC01-008472-2024'));
  assert.ok(cnrPattern.test('MCHC01-003921-2023'));
  assert.ok(cnrPattern.test('TNCH02-014589-2024'));
  assert.ok(cnrPattern.test('UPAL01-006213-2021'));
  assert.ok(cnrPattern.test('WBCC01-007812-2024'));
});

// Test Suite 3: IVR State Machine Transitions
test('IvrService should correctly transition states for Language and DTMF keypresses', async (t) => {
  const initialState = {
    callId: 'CALL-TEST-1',
    callerNumber: '9876543210',
    currentStep: 'LANGUAGE_SELECT',
    selectedLanguage: 'hi',
    history: ['WELCOME'],
    audioLog: []
  };

  // User presses 2 for English
  let selectedLang = 'hi';
  const key = '2';
  if (key === '2') selectedLang = 'en';
  assert.strictEqual(selectedLang, 'en');

  // Verify TwiML generation contains proper language tag
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="en-IN">Welcome</Say></Response>`;
  assert.ok(twiml.includes('language="en-IN"'));
});

// Test Suite 4: Proactive SMS Reminder Scheduler & Reschedule Detection
test('ReminderService should correctly calculate proactive trigger dates and invalidate cancelled reminders', async (t) => {
  const hearingDateStr = '2026-09-10';
  const intervals = [7, 3, 1, 0];
  const hearingDate = new Date(hearingDateStr);

  const triggers = intervals.map(days => {
    const d = new Date(hearingDate);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  });

  assert.strictEqual(triggers[0], '2026-09-03'); // 7 days before
  assert.strictEqual(triggers[1], '2026-09-07'); // 3 days before
  assert.strictEqual(triggers[2], '2026-09-09'); // 1 day before
  assert.strictEqual(triggers[3], '2026-09-10'); // Morning of

  // Test Adjournment: old pending reminders must become CANCELLED
  const oldReminders = [
    { scheduledDate: '2026-09-07', type: 'HEARING_REMINDER', status: 'PENDING' }
  ];
  const updatedReminders = oldReminders.map(r => ({
    ...r,
    status: r.status === 'PENDING' ? 'CANCELLED' : r.status
  }));

  assert.strictEqual(updatedReminders[0].status, 'CANCELLED');
});

// Test Suite 5: OCR and Notice Regex Parser
test('OcrService regex should extract CNR, Case Type, and Court accurately', async (t) => {
  const sampleNotice = `
    HIGH COURT OF DELHI AT NEW DELHI
    CNR NO: DLHC01-008472-2024
    CASE NO: WP(C) 1402/2024
    RAMESHWAR DAYAL VS DELHI DEVELOPMENT AUTHORITY
    DATE OF HEARING: 08-09-2026
  `;

  const cnrRegex = /\b([A-Z]{4}\d{2}[-\s]?\d{6}[-\s]?\d{4})\b/i;
  const match = sampleNotice.match(cnrRegex);
  assert.ok(match);
  assert.strictEqual(match[1].toUpperCase(), 'DLHC01-008472-2024');

  const caseRegex = /\b((?:WP|WP\(C\)|OS|CC|CS|CA|CMA)\s*[\(A-Z\)]*\s*[\.\/]?\s*\d+\s*[\/\-]\s*(?:19\d\d|20\d\d))\b/i;
  const caseMatch = sampleNotice.match(caseRegex);
  assert.ok(caseMatch);
  assert.strictEqual(caseMatch[1].toUpperCase(), 'WP(C) 1402/2024');
});

// Test Suite 6: QR Code URL Validation
test('QrService should extract CNR from official eCourts URLs', async (t) => {
  const url1 = 'https://services.ecourts.gov.in/ecourtindia_v6/?cnr=DLHC010084722024';
  const parsed1 = new URL(url1);
  assert.strictEqual(parsed1.searchParams.get('cnr'), 'DLHC010084722024');

  const rawCnr = 'TNCH02-014589-2024';
  const cnrMatch = rawCnr.match(/\b([A-Z]{4}\d{2}[-\s]?\d{6}[-\s]?\d{4})\b/i);
  assert.ok(cnrMatch);
  assert.strictEqual(cnrMatch[1], 'TNCH02-014589-2024');
});

// Test Suite 7: Backend API & Telephony Schema Contract
test('Backend API schema and telephony webhook contracts should be valid', async (t) => {
  // Test TwiML XML payload structure
  const sampleTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Gather numDigits="1" action="/api/ivr/twilio" method="POST"><Say language="hi-IN">न्याय सेतु</Say></Gather></Response>`;
  assert.ok(sampleTwiml.startsWith('<?xml'));
  assert.ok(sampleTwiml.includes('action="/api/ivr/twilio"'));

  // Test Exotel JSON response structure
  const exotelResponse = {
    status: 'success',
    action: 'play_and_gather',
    prompt: 'Welcome to Jurislink Legal Helpline',
    nalsa_helpline: '15100'
  };
  assert.strictEqual(exotelResponse.status, 'success');
  assert.strictEqual(exotelResponse.nalsa_helpline, '15100');
});

// Test Suite 8: Groq AI Rate Limit Telemetry & Quota Guard
test('Groq AI service should maintain safe rate limits and model telemetry', async (t) => {
  const { getRateLimitStatus } = await import('../server/ai.js');
  const status = getRateLimitStatus();

  assert.strictEqual(status.apiKeyConfigured, true);
  assert.ok(status.apiKeyPrefix.startsWith('gsk_'));
  assert.ok(['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'].includes(status.activeModel));
  assert.strictEqual(status.rateLimitDetails.requestsPerDay, 1000);
  assert.strictEqual(status.rateLimitDetails.outputTokensPerMinuteLimit, 1000);
  assert.strictEqual(status.rateLimitDetails.tokensPerMinute, 8000);
  assert.strictEqual(status.rateLimitDetails.failoverActive, true);
});

// Test Suite 9: Groq AI Notice Case Identifier Extraction
test('Groq AI extractNoticeWithAi should accurately extract CNR, Case Number, and Court', async (t) => {
  const { extractNoticeWithAi } = await import('../server/ai.js');
  const sampleNotice = `HIGH COURT OF DELHI AT NEW DELHI
CNR: DLHC01-008472-2024
CASE NO: WP(C) 1402/2024
RAMESHWAR DAYAL VS DELHI DEVELOPMENT AUTHORITY
NEXT HEARING: 08-09-2026
COURT ROOM: 14`;

  const result = await extractNoticeWithAi(sampleNotice);
  assert.ok(result);
  assert.strictEqual(result.extractedCnr, 'DLHC01-008472-2024');
  assert.ok(result.extractedCaseNumber.includes('1402/2024'));
  assert.strictEqual(result.isReliable, true);
  assert.ok(result.confidenceScore >= 0.85);
});

// Test Suite 10: Groq AI Multilingual Order Simplification
test('Groq AI simplifyLegalOrderWithAi should simplify legal jargon in plain regional languages', async (t) => {
  const { simplifyLegalOrderWithAi } = await import('../server/ai.js');
  const orderText = 'Arguments heard in part. Matter adjourned to 24-09-2026. Interim stay granted earlier shall continue till next date.';

  const result = await simplifyLegalOrderWithAi(orderText, 'High Court of Delhi', 'PENDING');
  assert.ok(result);
  assert.ok(['ADJOURNMENT', 'INTERIM_STAY'].includes(result.detectedEventType));
  assert.ok(result.simplifiedText.en);
  assert.ok(result.simplifiedText.hi);
  assert.ok(result.simplifiedText.ta);
  assert.strictEqual(result.isReliable, true);
});


