// Core Type Definitions for Jurislink Platform

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'mr' | 'bn' | 'gu';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  voiceLangCode: string;
}

export type CaseStatus = 'PENDING' | 'DISPOSED' | 'ADJOURNED' | 'TRANSFERRED' | 'STALE' | 'SOURCE_UNAVAILABLE';

export type EventType = 
  | 'NOTICE_ISSUED'
  | 'FIRST_HEARING'
  | 'ADJOURNMENT'
  | 'EVIDENCE_RECORDING'
  | 'ARGUMENTS'
  | 'ORDER_PASSED'
  | 'BAIL_HEARING'
  | 'CHARGES_FRAMED'
  | 'JUDGMENT_PRONOUNCED'
  | 'DECREE_DRAWN'
  | 'MEDIATION_REFERRED';

export interface CaseParty {
  name: string;
  advocate?: string;
  type: 'PETITIONER' | 'RESPONDENT' | 'COMPLAINANT' | 'ACCUSED' | 'APPELLANT';
}

export interface CaseHearing {
  date: string; // ISO date 'YYYY-MM-DD'
  purpose: string;
  business?: string;
  judge?: string;
  courtRoom?: string;
  isPast: boolean;
  simplifiedExplanation?: Record<SupportedLanguage, string>;
}

export interface CaseOrder {
  orderNumber: string;
  date: string;
  orderType: string;
  judge: string;
  rawText: string;
  pdfUrl?: string;
  simplifiedSummary: Record<SupportedLanguage, string>;
  isInterim: boolean;
  confidenceScore: number; // 0.0 to 1.0
  lowConfidenceReason?: string;
}

export interface CaseTimelineItem {
  id: string;
  date: string;
  title: string;
  type: EventType;
  description: string;
  simplifiedText: Record<SupportedLanguage, string>;
  isCompleted: boolean;
  isUpcoming: boolean;
}

export interface CourtCase {
  cnr: string; // 16 alphanumeric eCourts standard CNR
  caseNumber: string;
  filingNumber?: string;
  caseType: string; // e.g. "OS - Original Suit", "WP - Writ Petition", "CC - Criminal Case"
  filingDate: string;
  registrationDate: string;
  courtName: string;
  state: string;
  district: string;
  courtComplex: string;
  courtRoomNumber: string;
  judgeName: string;
  
  status: CaseStatus;
  statusText: string;
  
  petitioner: CaseParty;
  respondent: CaseParty;
  
  actsAndSections: string[];
  firDetails?: {
    policeStation: string;
    firNumber: string;
    firYear: string;
  };
  
  // 4-Part Accessible Hierarchy (Core Jurislink Principle)
  accessibilitySummary: {
    whatHappened: Record<SupportedLanguage, string>;
    whatHappensNext: Record<SupportedLanguage, string>;
    whenDate: string; // Next hearing date or "Disposed"
    whenTime?: string;
    whereLocation: Record<SupportedLanguage, string>;
    clearNextAction: Record<SupportedLanguage, string>;
  };
  
  hearings: CaseHearing[];
  orders: CaseOrder[];
  timeline: CaseTimelineItem[];
  
  // Metadata & Freshness
  isDemoData: boolean;
  demoScenarioId?: string;
  dataSource: 'ECOURTS_LIVE' | 'NJDG_API' | 'SYNTHETIC_MOCK' | 'CACHED_OFFLINE';
  lastSyncedAt: string; // ISO timestamp
  dataFreshnessStatus: 'FRESH' | 'STALE' | 'CACHED' | 'UNAVAILABLE';
  hashChecksum: string;
}

export type DemoScenarioId = 
  | 'upcoming_hearing'
  | 'adjourned_case'
  | 'completed_case'
  | 'new_order_issued'
  | 'stale_data'
  | 'source_unavailable'
  | 'ocr_uncertainty';

export interface DemoScenario {
  id: DemoScenarioId;
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  cnr: string;
  badgeText: Record<SupportedLanguage, string>;
  badgeColor: string;
  caseData: CourtCase;
}

export interface ExtractedNoticeData {
  rawText: string;
  extractedCnr?: string;
  extractedCaseNumber?: string;
  extractedCourtName?: string;
  extractedHearingDate?: string;
  extractedParties?: string;
  petitioner?: string;
  respondent?: string;
  courtRoom?: string;
  confidenceScore: number;
  isReliable: boolean;
  lowConfidenceWarning?: Record<SupportedLanguage, string>;
  qrUrlFound?: string;
  aiModelUsed?: string;
  aiSummary?: {
    en?: string;
    hi?: string;
  };
}

export interface AiRateLimitTelemetry {
  activeModel: string;
  modelPool?: string[];
  limitRequests: number;
  limitTokens: number;
  outputTokensPerMinuteLimit?: number;
  remainingRequests: number;
  remainingTokens: number;
  resetRequests: string;
  resetTokens: string;
  lastUpdated: string;
  totalCallsMade: number;
  cacheHits: number;
  status: 'OPTIMAL' | 'ROTATED' | 'THROTTLED' | 'ERROR';
  apiKeyConfigured: boolean;
  apiKeyPrefix: string;
}

export interface ReminderPreference {
  id: string;
  cnr: string;
  caseNumber: string;
  phoneNumber: string;
  language: SupportedLanguage;
  enabledChannels: ('SMS' | 'WHATSAPP' | 'VOICE_CALL')[];
  remindDaysBefore: number[]; // e.g. [7, 3, 1, 0]
  lastNotificationSent?: string;
  scheduledReminders: {
    scheduledDate: string;
    type: 'HEARING_REMINDER' | 'RESCHEDULE_ALERT' | 'ORDER_ALERT';
    status: 'PENDING' | 'SENT' | 'CANCELLED';
    smsContent: string;
  }[];
}

export interface IvrCallState {
  callId: string;
  callerNumber: string;
  currentStep: 'WELCOME' | 'LANGUAGE_SELECT' | 'MAIN_MENU' | 'CNR_INPUT' | 'READ_CASE' | 'REMINDER_MENU' | 'LEGAL_AID' | 'GOODBYE';
  selectedLanguage: SupportedLanguage;
  activeCnr?: string;
  history: string[];
  audioLog: { timestamp: string; speaker: 'IVR' | 'USER'; text: string; dtmf?: string }[];
}

export interface UserProfile {
  phoneNumber: string;
  preferredLanguage: SupportedLanguage;
  isHighContrast: boolean;
  isVoiceAutoPlay: boolean;
  savedCnrs: string[];
  role: 'CITIZEN' | 'LEGAL_AID_VOLUNTEER' | 'COURT_STAFF';
  token?: string;
}
