import React from 'react';
import { Calendar, MapPin, ChevronRight, Bookmark, Volume2 } from 'lucide-react';
import { CourtCase, SupportedLanguage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioButton } from '../ui/AudioButton';

interface CaseCardProps {
  caseData: CourtCase;
  onSelect: () => void;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onSelect }) => {
  const { language, t } = useLanguage();
  const acc = caseData.accessibilitySummary;
  const whatNext = acc.whatHappensNext[language] || acc.whatHappensNext.en;
  const whenDate = acc.whenDate;

  return (
    <div
      onClick={onSelect}
      className="card-elevated"
      style={{
        cursor: 'pointer',
        borderLeft: '5px solid #f59e0b',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <span style={{
            background: '#0f172a',
            color: '#f59e0b',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {caseData.cnr}
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {caseData.caseNumber}
          </h3>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {caseData.courtName}
          </div>
        </div>

        <div style={{
          background: '#ecfdf5',
          color: '#047857',
          padding: '4px 10px',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Calendar size={14} />
          <span>{whenDate}</span>
        </div>
      </div>

      <p style={{
        fontSize: '0.92rem',
        color: '#334155',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        <strong>Next:</strong> {whatNext}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
        <AudioButton
          textToSpeak={`केस ${caseData.caseNumber}। अगली तारीख ${whenDate}। आगे क्या होगा: ${whatNext}`}
          size="sm"
          variant="subtle"
        />

        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#0284c7'
        }}>
          <span>View Details</span>
          <ChevronRight size={16} />
        </span>
      </div>
    </div>
  );
};
