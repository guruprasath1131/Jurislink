import { CourtCase, SupportedLanguage, ExtractedNoticeData, AiRateLimitTelemetry } from '../types';
import { courtDataProvider } from './courtDataProvider';
import { ReminderService } from './reminderService';
import { LegalNlpService, SimplificationResult } from './nlpService';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const DEFAULT_LANGUAGES: SupportedLanguage[] = ['en', 'hi', 'ta', 'te', 'kn', 'mr', 'bn', 'gu'];

function createMultilingualDict(baseText: string, localizedMap?: Partial<Record<SupportedLanguage, string>>): Record<SupportedLanguage, string> {
  const result: Record<SupportedLanguage, string> = {
    en: baseText,
    hi: baseText,
    ta: baseText,
    te: baseText,
    kn: baseText,
    mr: baseText,
    bn: baseText,
    gu: baseText
  };

  if (localizedMap) {
    for (const lang of DEFAULT_LANGUAGES) {
      if (localizedMap[lang]) {
        result[lang] = localizedMap[lang]!;
      }
    }
  }

  return result;
}

export class BackendApiService {
  private static isBackendAvailable: boolean | null = null;
  private static lastHealthCheckTime = 0;

  /**
   * Health check to detect if FastAPI backend is alive
   */
  static async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    // Cache health check for 10 seconds to avoid spamming
    if (this.isBackendAvailable !== null && (now - this.lastHealthCheckTime < 10000)) {
      return this.isBackendAvailable;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      this.isBackendAvailable = res.ok;
      this.lastHealthCheckTime = now;
      return res.ok;
    } catch {
      this.isBackendAvailable = false;
      this.lastHealthCheckTime = now;
      return false;
    }
  }

  /**
   * Hybrid Case Lookup by CNR:
   * First tries FastAPI backend REST endpoint.
   * If backend is down or case not in DB, seamlessly falls back to authentic courtDataProvider client scenarios.
   */
  static async getCaseByCnr(cnr: string): Promise<CourtCase | null> {
    try {
      const isAlive = await this.checkBackendHealth();
      if (isAlive) {
        const res = await fetch(`${API_BASE_URL}/cases/${encodeURIComponent(cnr.trim())}`);
        if (res.ok) {
          const data = await res.json();
          return this.mapBackendCaseToCourtCase(data);
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, using offline client provider:', err);
    }

    // Seamless offline client fallback
    return courtDataProvider.lookupByCnr(cnr);
  }

  /**
   * Hybrid Search Cases by party name or case number
   */
  static async searchCases(params: { partyName?: string; caseNumber?: string }): Promise<CourtCase[]> {
    try {
      const isAlive = await this.checkBackendHealth();
      if (isAlive) {
        const query = new URLSearchParams();
        if (params.partyName) query.set('partyName', params.partyName);
        if (params.caseNumber) query.set('caseNumber', params.caseNumber);

        const res = await fetch(`${API_BASE_URL}/cases?${query.toString()}`);
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) {
            return list.map((item: any) => this.mapBackendCaseToCourtCase(item));
          }
        }
      }
    } catch (err) {
      console.warn('Backend search unavailable, using offline search:', err);
    }

    return courtDataProvider.searchCases(params);
  }

  /**
   * Hybrid Register SMS Reminders
   */
  static async registerReminders(caseCnr: string, userPhone: string, hearingDate: string) {
    try {
      const isAlive = await this.checkBackendHealth();
      if (isAlive) {
        const res = await fetch(`${API_BASE_URL}/reminders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseCnr, userPhone, hearingDate })
        });
        if (res.ok) {
          return await res.json();
        }
      }
    } catch (err) {
      console.warn('Backend reminder registration unavailable, using client store:', err);
    }

    // Client fallback
    const mockCase = await courtDataProvider.lookupByCnr(caseCnr);
    if (mockCase) {
      return ReminderService.setupRemindersForCase(mockCase, userPhone, 'hi');
    }
    return null;
  }

  /**
   * Hybrid NLP Simplification
   */
  static async simplifyOrder(rawOrderText: string, courtName = 'High Court', caseStatus = 'PENDING'): Promise<SimplificationResult> {
    try {
      const isAlive = await this.checkBackendHealth();
      if (isAlive) {
        const res = await fetch(`${API_BASE_URL}/nlp/simplify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawOrderText, courtName, caseStatus })
        });
        if (res.ok) {
          return await res.json();
        }
      }
    } catch (err) {
      console.warn('Backend NLP unavailable, using client LegalNlpService:', err);
    }

    return LegalNlpService.simplifyOrder(rawOrderText, courtName, caseStatus);
  }

  /**
   * Get Live AI Telemetry and Rate Limits from Groq Backend
   */
  static async getAiStatus(): Promise<AiRateLimitTelemetry | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Failed to fetch AI status telemetry:', err);
    }
    return null;
  }

  /**
   * AI Notice Scanner & Case Identifier Extractor powered by Groq
   */
  static async extractNoticeWithAi(ocrText: string): Promise<ExtractedNoticeData | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/extract-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocrText })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('AI Notice extraction API unavailable, falling back:', err);
    }
    return null;
  }

  /**
   * AI Legal Assistant Q&A for specific case
   */
  static async askCaseAi(caseData: CourtCase, question: string, language = 'en'): Promise<{ answer: string; aiModelUsed?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/ask-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseData, question, language })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('AI Case Q&A API error:', err);
    }

    // Client fallback answer
    return {
      answer: `Hearing for ${caseData.caseNumber} is scheduled on ${caseData.accessibilitySummary.whenDate} at ${caseData.courtName}. Please arrive by 10:00 AM with your advocate and documents.`
    };
  }

  /**
   * AI Voice Query Processor
   */
  static async processVoiceQuery(transcript: string, language = 'hi'): Promise<{ matchedCnr: string | null; voiceReply: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/voice-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, language })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('AI Voice Query API error:', err);
    }

    return {
      matchedCnr: null,
      voiceReply: language === 'hi'
        ? 'माफ़ कीजिए, आवाज़ से केस नहीं मिला। कृपया सीएनआर नंबर टाइप करें।'
        : 'Could not match case from voice. Please enter CNR or scan notice.'
    };
  }

  /**
   * Tamil Live Conversational AI Assistant
   * Maintains conversation history and replies in Tamil/Hindi/English
   */
  static async tamilAssist(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    language: string = 'ta'
  ): Promise<{ reply: string; matchedCnr: string | null; fallback?: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/tamil-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, language })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Tamil assist API error:', err);
    }

    const fallbacks: Record<string, string> = {
      ta: 'மன்னிக்கவும், சேவை கிடைக்கவில்லை. CNR எண்ணை தாருங்கள்.',
      hi: 'माफ़ कीजिए, सेवा उपलब्ध नहीं। CNR नंबर बताएं।',
      en: 'Service unavailable. Please provide your CNR number.'
    };
    return {
      reply: fallbacks[language] || fallbacks.en,
      matchedCnr: null,
      fallback: true
    };
  }


  /**
   * Create or Sync a Scanned Case into the SQLite Backend Database
   */
  static async createOrSyncCase(caseData: Partial<CourtCase>): Promise<CourtCase> {
    try {
      const res = await fetch(`${API_BASE_URL}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnr: caseData.cnr,
          caseNumber: caseData.caseNumber,
          courtName: caseData.courtName || 'District Court',
          courtroom: caseData.courtRoomNumber || 'Court Room 1',
          petitioner: caseData.petitioner?.name || 'Petitioner',
          respondent: caseData.respondent?.name || 'Respondent',
          nextHearingDate: caseData.accessibilitySummary?.whenDate || '2026-10-15',
          status: caseData.status || 'PENDING',
          stage: caseData.statusText || 'Notice Issued / Scanned Record'
        })
      });
      if (res.ok) {
        const created = await res.json();
        return this.mapBackendCaseToCourtCase(created);
      }
    } catch (err) {
      console.warn('Could not sync case to backend DB:', err);
    }

    // Return constructed client object
    return caseData as CourtCase;
  }

  /**
   * Helper to map backend response to frontend CourtCase interface
   */
  private static mapBackendCaseToCourtCase(data: any): CourtCase {
    const summaryPast = createMultilingualDict(
      data.summaryPast?.en || 'Previous proceedings recorded.',
      data.summaryPast
    );
    const summaryNext = createMultilingualDict(
      data.summaryNext?.en || 'Next hearing scheduled.',
      data.summaryNext
    );
    const whereLocation = createMultilingualDict(
      `${data.courtroom || 'Court Room'}, ${data.courtName || 'Court Complex'}`,
      data.whereLocation
    );
    const clearNextAction = createMultilingualDict(
      data.whatToDo?.en || 'Be present with your advocate and documents.',
      data.whatToDo
    );

    return {
      cnr: data.cnr,
      caseNumber: data.caseNumber || data.case_number || 'WP 0/0',
      caseType: data.caseType || data.courtType || 'Civil Petition',
      filingDate: data.filingDate || '2024-01-01',
      registrationDate: data.registrationDate || '2024-01-05',
      courtName: data.courtName || 'Court',
      state: data.state || 'India',
      district: data.district || '',
      courtComplex: data.courtComplex || 'Court Complex',
      courtRoomNumber: data.courtroom || 'Court Room 1',
      judgeName: data.judge || 'Hon\'ble Judge',
      status: (data.status as any) || 'PENDING',
      statusText: data.stage || 'Listed for Hearing',
      petitioner: {
        name: data.petitioner || 'Petitioner',
        type: 'PETITIONER'
      },
      respondent: {
        name: data.respondent || 'Respondent',
        type: 'RESPONDENT'
      },
      actsAndSections: ['Constitution of India'],
      accessibilitySummary: {
        whatHappened: summaryPast,
        whatHappensNext: summaryNext,
        whenDate: data.nextHearingDate || '2026-09-15',
        whereLocation: whereLocation,
        clearNextAction: clearNextAction
      },
      hearings: (data.events || []).map((ev: any) => ({
        date: ev.date || ev.event_date || '2024-01-01',
        purpose: ev.purpose || 'Hearing',
        business: ev.businessRecorded || '',
        judge: ev.judge || '',
        isPast: true
      })),
      orders: [],
      timeline: [],
      isDemoData: false,
      dataSource: 'NJDG_API',
      lastSyncedAt: new Date().toISOString(),
      dataFreshnessStatus: 'FRESH',
      hashChecksum: 'API-SYNCED'
    };
  }
}
