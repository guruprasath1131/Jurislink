import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Camera, 
  FolderOpen, 
  Mic, 
  Bell, 
  PhoneCall, 
  HelpCircle, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  QrCode
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { VoiceProvider } from './context/VoiceContext';
import { CaseProvider, useCase } from './context/CaseContext';
import { Header } from './components/layout/Header';
import { Navigation, NavTab } from './components/layout/Navigation';
import { DemoBanner } from './components/cases/DemoBanner';
import { CaseHierarchyView } from './components/cases/CaseHierarchyView';
import { CaseCard } from './components/cases/CaseCard';
import { NoticeScanner } from './components/scan/NoticeScanner';
import { QrScanner } from './components/scan/QrScanner';
import { IvrSimulator } from './components/ivr/IvrSimulator';
import { ReminderManager } from './components/reminders/ReminderManager';
import { VoiceAssistModal } from './components/voice/VoiceAssistModal';
import { TamilVoiceAssistant } from './components/voice/TamilVoiceAssistant';
import { LegalGlossary } from './components/help/LegalGlossary';
import { ExtractedNoticeData } from './types';
import { BackendApiService } from './services/backendApi';

const MainAppContent: React.FC = () => {
  const { language, t } = useLanguage();
  const { 
    activeCase, 
    setActiveCase, 
    savedCases, 
    lookupCnr, 
    searchCases, 
    isLoading, 
    error, 
    clearError 
  } = useCase();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [cnrInput, setCnrInput] = useState('');
  const [partyInput, setPartyInput] = useState('');
  const [caseNumInput, setCaseNumInput] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isLiveTamilOpen, setIsLiveTamilOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'OCR' | 'QR'>('OCR');

  const handleCnrSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnrInput.trim()) return;
    const c = await lookupCnr(cnrInput.trim());
    if (c) {
      setActiveTab('home');
    }
  };

  const handleDetailsSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await searchCases({ partyName: partyInput, caseNumber: caseNumInput });
    if (results.length > 0) {
      setActiveTab('home');
    }
  };

  const handleCaseExtractedFromNotice = async (data: ExtractedNoticeData) => {
    clearError();
    if (data.extractedCnr) {
      const found = await lookupCnr(data.extractedCnr);
      if (found) {
        setActiveTab('home');
        return;
      }
    }
    
    if (data.extractedCaseNumber) {
      const results = await searchCases({ caseNumber: data.extractedCaseNumber });
      if (results.length > 0) {
        setActiveTab('home');
        return;
      }
    }

    // Auto-register newly scanned notice into database
    const effectiveCnr = data.extractedCnr || `DLHC01-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    const newCase = await BackendApiService.createOrSyncCase({
      cnr: effectiveCnr,
      caseNumber: data.extractedCaseNumber || 'WP(C) 1402/2026',
      courtName: data.extractedCourtName || 'High Court of Delhi at New Delhi',
      courtRoomNumber: data.courtRoom || 'Court Room 14',
      petitioner: { name: data.petitioner || data.extractedParties?.split('vs')[0]?.trim() || 'Petitioner', type: 'PETITIONER' },
      respondent: { name: data.respondent || data.extractedParties?.split('vs')[1]?.trim() || 'Respondent', type: 'RESPONDENT' },
      status: 'PENDING',
      statusText: 'Scanned Notice Registered',
      accessibilitySummary: {
        whenDate: data.extractedHearingDate || '2026-09-08',
        whatHappened: {
          en: data.aiSummary?.en || 'Case details verified and registered from scanned court notice.',
          hi: data.aiSummary?.hi || 'स्कैन किए गए नोटिस से केस विवरण सत्यापित और दर्ज किया गया।'
        } as any,
        whatHappensNext: {
          en: 'Case is listed for hearing. Both parties to appear with relevant records.',
          hi: 'मामला सुनवाई के लिए सूचीबद्ध है। दोनों पक्षों को रिकॉर्ड के साथ उपस्थित होना है।'
        } as any,
        whereLocation: {
          en: `${data.courtRoom || 'Court Room 14'}, ${data.extractedCourtName || 'High Court of Delhi'}`,
          hi: `${data.courtRoom || 'कोर्ट रूम 14'}, ${data.extractedCourtName || 'हाई कोर्ट'}`
        } as any,
        clearNextAction: {
          en: 'Be present at the court complex on the hearing date with your advocate and documents.',
          hi: 'सुनवाई की तारीख पर अपने वकील और कागजातों के साथ कोर्ट परिसर में उपस्थित रहें।'
        } as any
      }
    });

    setActiveCase(newCase);
    setActiveTab('home');
  };

  const handleCnrFoundFromQr = async (cnr: string) => {
    await lookupCnr(cnr);
    setActiveTab('home');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Language Selector & Voice Toggle */}
      <Header onOpenIvr={() => setActiveTab('ivr_phone')} />

      {/* Navigation Top Bar (Desktop) & Bottom Bar (Mobile) */}
      <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Container */}
      <main className="app-container" style={{ flex: 1, width: '100%' }}>
        {/* Demo Mode Scenario Switcher Banner */}
        <DemoBanner />

        {/* Global Error Alert */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#991b1b',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              style={{
                minHeight: '30px',
                padding: '2px 10px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.8rem'
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: HOME VIEW */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Quick Action Tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px'
            }}>
              <button
                onClick={() => setActiveTab('check_case')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '14px 8px',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Search size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{t.navCheckCase}</span>
              </button>

              <button
                onClick={() => setActiveTab('scan_notice')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '14px 8px',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{t.navScanNotice}</span>
              </button>

              <button
                onClick={() => setIsLiveTamilOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                  border: '2px solid rgba(124,58,237,0.2)',
                  padding: '14px 8px',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: '#7c3aed', color: '#fff',
                  fontSize: '0.55rem', fontWeight: 800, padding: '1px 4px', borderRadius: '4px'
                }}>AI</div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
                }}>
                  <Mic size={20} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4c1d95' }}>தமிழ் AI</span>
                <span style={{ fontSize: '0.62rem', color: '#7c3aed', fontWeight: 600, marginTop: '-4px' }}>Voice Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('ivr_phone')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '14px 8px',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PhoneCall size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{t.navIvrPhone}</span>
              </button>

              <button
                onClick={() => setActiveTab('reminders')}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  padding: '14px 8px',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{t.navReminders}</span>
              </button>
            </div>

            {/* Active Case Hierarchy View */}
            {activeCase ? (
              <CaseHierarchyView
                caseData={activeCase}
                onOpenReminders={() => setActiveTab('reminders')}
              />
            ) : (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Scale size={48} color="#f59e0b" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>No Case Selected</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '6px auto 16px auto' }}>
                  Search your case by CNR, scan your court notice photo, or pick a demo scenario above.
                </p>
                <button
                  onClick={() => setActiveTab('check_case')}
                  style={{ background: '#f59e0b', color: '#0f172a', margin: '0 auto', padding: '0 20px' }}
                >
                  <Search size={18} />
                  <span>Lookup a Case</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY SAVED CASES */}
        {activeTab === 'my_cases' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FolderOpen size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {t.navMyCases}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Saved cases securely stored offline with cached hearing dates and orders
                  </p>
                </div>
              </div>
            </div>

            {savedCases.length === 0 ? (
              <div className="card-elevated" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FolderOpen size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No Saved Cases Yet</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                  Tap "Save Case" on any case to store it for instant offline access.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savedCases.map((rec) => (
                  <CaseCard
                    key={rec.caseData.cnr}
                    caseData={rec.caseData}
                    onSelect={() => {
                      setActiveCase(rec.caseData);
                      setActiveTab('home');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CHECK CASE SEARCH */}
        {activeTab === 'check_case' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search by CNR Form */}
            <div className="card-elevated">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                🔍 {t.searchByCnr}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                Enter the 16-character CNR printed on your court summons or previous order sheet.
              </p>

              <form onSubmit={handleCnrSearch} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={cnrInput}
                  onChange={(e) => setCnrInput(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid #cbd5e1',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: '#f59e0b',
                    color: '#0f172a',
                    padding: '0 24px',
                    fontWeight: 800
                  }}
                >
                  <Search size={18} />
                  <span>{t.searchBtn}</span>
                </button>
              </form>

              {/* Sample CNR quick buttons */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Quick Paste:</span>
                <button
                  onClick={() => setCnrInput('DLHC01-008472-2024')}
                  style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', fontSize: '0.75rem', minHeight: '26px' }}
                >
                  DLHC01-008472-2024 (Delhi HC)
                </button>
                <button
                  onClick={() => setCnrInput('MCHC01-003921-2023')}
                  style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', fontSize: '0.75rem', minHeight: '26px' }}
                >
                  MCHC01-003921-2023 (Bombay HC)
                </button>
                <button
                  onClick={() => setCnrInput('TNCH02-014589-2024')}
                  style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', fontSize: '0.75rem', minHeight: '26px' }}
                >
                  TNCH02-014589-2024 (Madras HC)
                </button>
              </div>
            </div>

            {/* Search by Case Details & Parties */}
            <div className="card-elevated">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                {t.or} {t.searchByDetails}
              </h2>

              <form onSubmit={handleDetailsSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    {t.partyName}
                  </label>
                  <input
                    type="text"
                    value={partyInput}
                    onChange={(e) => setPartyInput(e.target.value)}
                    placeholder="e.g. Rameshwar Dayal or Sunita Shinde"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Case Number / Year
                  </label>
                  <input
                    type="text"
                    value={caseNumInput}
                    onChange={(e) => setCaseNumInput(e.target.value)}
                    placeholder="e.g. 1402/2024 or WP 512"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    padding: '0 20px',
                    fontWeight: 800,
                    marginTop: '4px'
                  }}
                >
                  <Search size={18} />
                  <span>Search by Details</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: SCAN NOTICE (OCR & QR) */}
        {activeTab === 'scan_notice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Mode Switcher (OCR Notice vs QR Code) */}
            <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setScanMode('OCR')}
                style={{
                  flex: 1,
                  background: scanMode === 'OCR' ? '#ffffff' : 'transparent',
                  color: scanMode === 'OCR' ? '#0f172a' : '#64748b',
                  boxShadow: scanMode === 'OCR' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 800,
                  minHeight: '40px'
                }}
              >
                <Camera size={18} />
                <span>📷 Scan Notice Photo (OCR)</span>
              </button>

              <button
                onClick={() => setScanMode('QR')}
                style={{
                  flex: 1,
                  background: scanMode === 'QR' ? '#ffffff' : 'transparent',
                  color: scanMode === 'QR' ? '#0f172a' : '#64748b',
                  boxShadow: scanMode === 'QR' ? 'var(--shadow-sm)' : 'none',
                  fontWeight: 800,
                  minHeight: '40px'
                }}
              >
                <QrCode size={18} />
                <span>📱 Scan Notice QR Code</span>
              </button>
            </div>

            {scanMode === 'OCR' ? (
              <NoticeScanner onCaseExtracted={handleCaseExtractedFromNotice} />
            ) : (
              <QrScanner onCnrFound={handleCnrFoundFromQr} />
            )}
          </div>
        )}

        {/* TAB 5: VOICE ASSIST */}
        {activeTab === 'voice_assist' && (
          <div className="card-elevated" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Mic size={54} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Voice Case Assistant (आवाज़ से पूछें)
            </h2>
            <p style={{ color: '#64748b', maxWidth: '440px', margin: '8px auto 24px auto', lineHeight: 1.5 }}>
              Ask questions about your case status, hearing date, or courtroom in any Indian language.
            </p>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                padding: '0 28px',
                minHeight: '52px',
                fontSize: '1.05rem',
                fontWeight: 800,
                margin: '0 auto'
              }}
            >
              <Mic size={22} color="#f59e0b" />
              <span>Open Spoken Voice Query</span>
            </button>
          </div>
        )}

        {/* TAB 6: REMINDERS & SMS */}
        {activeTab === 'reminders' && (
          <ReminderManager />
        )}

        {/* TAB 7: 2G FEATURE PHONE IVR SIMULATOR */}
        {activeTab === 'ivr_phone' && (
          <IvrSimulator />
        )}

        {/* TAB 8: HELP & GLOSSARY */}
        {activeTab === 'help' && (
          <LegalGlossary />
        )}
      </main>

      {/* Legacy Voice Assistant Modal (kept for backwards compat) */}
      <VoiceAssistModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onCnrFound={(cnr) => {
          setIsVoiceModalOpen(false);
          lookupCnr(cnr);
          setActiveTab('home');
        }}
      />

      {/* NEW: Live Tamil Conversational AI Voice Assistant */}
      <TamilVoiceAssistant
        isOpen={isLiveTamilOpen}
        onClose={() => setIsLiveTamilOpen(false)}
        onCnrFound={(cnr) => {
          setIsLiveTamilOpen(false);
          lookupCnr(cnr);
          setActiveTab('home');
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <VoiceProvider>
        <CaseProvider>
          <MainAppContent />
        </CaseProvider>
      </VoiceProvider>
    </LanguageProvider>
  );
};

export default App;
