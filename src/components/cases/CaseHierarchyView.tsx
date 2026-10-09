import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Bell, 
  Share2, 
  Clock, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CourtCase, SupportedLanguage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCase } from '../../context/CaseContext';
import { AudioButton } from '../ui/AudioButton';
import { FreshnessBadge } from './FreshnessBadge';
import { CaseTimeline } from './CaseTimeline';
import { OfficialDataDrawer } from './OfficialDataDrawer';
import { AiCaseAssistant } from './AiCaseAssistant';

interface CaseHierarchyViewProps {
  caseData: CourtCase;
  onOpenReminders?: () => void;
}

export const CaseHierarchyView: React.FC<CaseHierarchyViewProps> = ({ caseData, onOpenReminders }) => {
  const { language, t } = useLanguage();
  const { isSaved, saveCase, removeCase } = useCase();
  const [isOfficialDrawerOpen, setIsOfficialDrawerOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const acc = caseData.accessibilitySummary;
  const whatHappened = acc.whatHappened[language] || acc.whatHappened.en;
  const whatHappensNext = acc.whatHappensNext[language] || acc.whatHappensNext.en;
  const whereLoc = acc.whereLocation[language] || acc.whereLocation.en;
  const nextAction = acc.clearNextAction[language] || acc.clearNextAction.en;
  const whenDate = acc.whenDate;
  const whenTime = acc.whenTime || '10:30 AM';

  const saved = isSaved(caseData.cnr);

  const handleSaveToggle = () => {
    if (saved) {
      removeCase(caseData.cnr);
    } else {
      saveCase(caseData);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Jurislink Case: ${caseData.caseNumber}`,
        text: `Hearing for Case ${caseData.caseNumber} is on ${whenDate} at ${caseData.courtName}. View simple explanation on Jurislink.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}?cnr=${caseData.cnr}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  // Full spoken narration string for the top master audio button
  const fullNarrativeAudio = `केस विवरण। ${caseData.caseNumber}। न्यायालय: ${caseData.courtName}। ${t.whatHappened}: ${whatHappened}। ${t.whatHappensNext}: ${whatHappensNext}। ${t.when}: ${whenDate}। ${t.where}: ${whereLoc}। ${t.actionNeeded}: ${nextAction}।`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="card-elevated" style={{
        borderLeft: '6px solid #f59e0b',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                background: '#0f172a',
                color: '#f59e0b',
                padding: '4px 10px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                {caseData.cnr}
              </span>
              <FreshnessBadge
                status={caseData.dataFreshnessStatus}
                lastSyncedAt={caseData.lastSyncedAt}
                source={caseData.dataSource}
              />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {caseData.caseNumber}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 600 }}>
              {caseData.courtName}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSaveToggle}
              style={{
                background: saved ? '#dcfce7' : '#f1f5f9',
                color: saved ? '#15803d' : '#334155',
                border: '1px solid ' + (saved ? '#86efac' : '#cbd5e1'),
                padding: '0 14px',
                minHeight: '42px',
                fontWeight: 700
              }}
              title={saved ? 'Case saved for offline access' : 'Save case to my cases'}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              <span>{saved ? t.saved : t.saveCase}</span>
            </button>

            <button
              onClick={handleShare}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0 12px',
                minHeight: '42px'
              }}
              title="Share Case Link"
            >
              <Share2 size={18} />
            </button>

            {onOpenReminders && (
              <button
                onClick={onOpenReminders}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '0 14px',
                  minHeight: '42px',
                  fontWeight: 700
                }}
                title="Manage SMS Hearing Reminders"
              >
                <Bell size={18} />
                <span className="hide-mobile">SMS Alerts</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Listen to Entire Case Button */}
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>
              🔊 {t.hearAudio} (Listen in {language.toUpperCase()})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
              High clarity voice readout of the 4 key facts for low-literacy users
            </div>
          </div>
          <AudioButton textToSpeak={fullNarrativeAudio} label={t.hearAudio} size="md" variant="accent" />
        </div>
      </div>

      {/* 4 CORE ACCESSIBILITY SECTIONS IN STRICT MANDATED HIERARCHY */}
      
      {/* 1. WHAT HAPPENED? */}
      <div className="card-elevated" style={{
        borderLeft: '6px solid #3b82f6',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
              {t.whatHappened}
            </h3>
          </div>
          <AudioButton textToSpeak={`${t.whatHappened}. ${whatHappened}`} size="sm" variant="subtle" />
        </div>

        <p style={{
          marginTop: '12px',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: '#1e293b',
          fontWeight: 600
        }}>
          {whatHappened}
        </p>
      </div>

      {/* 2. WHAT HAPPENS NEXT? */}
      <div className="card-elevated" style={{
        borderLeft: '6px solid #8b5cf6',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f5f3ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#581c87', margin: 0 }}>
              {t.whatHappensNext}
            </h3>
          </div>
          <AudioButton textToSpeak={`${t.whatHappensNext}. ${whatHappensNext}`} size="sm" variant="subtle" />
        </div>

        <p style={{
          marginTop: '12px',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: '#1e293b',
          fontWeight: 600
        }}>
          {whatHappensNext}
        </p>
      </div>

      {/* 3. WHEN? (HEARING DATE & TIME) */}
      <div className="card-elevated" style={{
        borderLeft: '6px solid #10b981',
        background: '#f0fdf4'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
              {t.when}
            </h3>
          </div>
          <AudioButton textToSpeak={`${t.when}. ${whenDate} ${whenTime}`} size="sm" variant="subtle" />
        </div>

        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#15803d',
            letterSpacing: '-0.02em'
          }}>
            {whenDate}
          </span>
          {whenTime && (
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#166534',
              background: '#dcfce7',
              padding: '2px 10px',
              borderRadius: '6px'
            }}>
              {whenTime}
            </span>
          )}
        </div>
      </div>

      {/* 4. WHERE? (COURT & LOCATION) */}
      <div className="card-elevated" style={{
        borderLeft: '6px solid #ea580c',
        background: '#fff7ed'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ffedd5',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c2d12', margin: 0 }}>
              {t.where}
            </h3>
          </div>
          <AudioButton textToSpeak={`${t.where}. ${whereLoc}`} size="sm" variant="subtle" />
        </div>

        <p style={{
          marginTop: '12px',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#9a3412',
          lineHeight: 1.5
        }}>
          {whereLoc}
        </p>

        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#7c2d12' }}>
          <strong>Bench / Judge:</strong> {caseData.judgeName}
        </div>
      </div>

      {/* 5. ACTION NEEDED CALLOUT */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        border: '2px solid #f59e0b',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={22} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>
              {t.actionNeeded}
            </h3>
          </div>
          <AudioButton textToSpeak={`${t.actionNeeded}. ${nextAction}`} size="sm" variant="accent" />
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#f8fafc', fontWeight: 600 }}>
          {nextAction}
        </p>
      </div>

      {/* Groq AI Legal Assistant Q&A */}
      <AiCaseAssistant caseData={caseData} />

      {/* Official Data Button Drawer Trigger */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
            {t.viewOfficialData}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Inspect full raw NJDG legal records, FIR details, judge signatures & statutory acts
          </div>
        </div>

        <button
          onClick={() => setIsOfficialDrawerOpen(true)}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            padding: '0 16px',
            minHeight: '44px',
            fontWeight: 700
          }}
        >
          <FileText size={18} />
          <span>{t.viewOfficialData}</span>
        </button>
      </div>

      {/* Chronological Timeline */}
      <div className="card-elevated">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          📜 Case History & Hearing Timeline
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Chronological record of orders, adjournments, and proceedings
        </p>

        <CaseTimeline timeline={caseData.timeline} language={language} />
      </div>

      {/* Official Data Drawer */}
      <OfficialDataDrawer
        caseData={caseData}
        isOpen={isOfficialDrawerOpen}
        onClose={() => setIsOfficialDrawerOpen(false)}
      />

      {/* Toast Notification */}
      {showShareToast && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '30px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
          fontWeight: 700,
          zIndex: 100,
          fontSize: '0.9rem'
        }}>
          ✅ Case link copied to clipboard!
        </div>
      )}
    </div>
  );
};
