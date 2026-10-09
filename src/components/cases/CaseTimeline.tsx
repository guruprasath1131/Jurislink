import React from 'react';
import { Calendar, CheckCircle2, Clock, FileText, AlertCircle, Scale, ShieldAlert } from 'lucide-react';
import { CaseTimelineItem, SupportedLanguage } from '../../types';
import { AudioButton } from '../ui/AudioButton';

interface CaseTimelineProps {
  timeline: CaseTimelineItem[];
  language: SupportedLanguage;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ timeline, language }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PASSED':
      case 'JUDGMENT_PRONOUNCED':
        return <FileText size={18} color="#0284c7" />;
      case 'ADJOURNMENT':
        return <Clock size={18} color="#f59e0b" />;
      case 'NOTICE_ISSUED':
        return <AlertCircle size={18} color="#8b5cf6" />;
      case 'ARGUMENTS':
        return <Scale size={18} color="#10b981" />;
      default:
        return <Calendar size={18} color="#64748b" />;
    }
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', margin: '16px 0' }}>
      {/* Vertical Timeline Track Line */}
      <div style={{
        position: 'absolute',
        left: '11px',
        top: '8px',
        bottom: '8px',
        width: '3px',
        background: '#e2e8f0',
        borderRadius: '2px'
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {timeline.map((item, idx) => {
          const simplified = item.simplifiedText[language] || item.simplifiedText.en;
          const isLatest = idx === timeline.length - 1;

          return (
            <div key={item.id} style={{ position: 'relative' }}>
              {/* Bullet Node */}
              <div style={{
                position: 'absolute',
                left: '-28px',
                top: '0px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: item.isUpcoming ? '#f59e0b' : (item.isCompleted ? '#10b981' : '#ffffff'),
                border: '3px solid #ffffff',
                boxShadow: '0 0 0 2px ' + (item.isUpcoming ? '#f59e0b' : '#cbd5e1'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                {item.isCompleted && <CheckCircle2 size={14} />}
                {item.isUpcoming && <Clock size={14} />}
              </div>

              {/* Event Card */}
              <div style={{
                background: item.isUpcoming ? 'rgba(254, 243, 199, 0.4)' : '#ffffff',
                border: item.isUpcoming ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getEventIcon(item.type)}
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {item.title}
                    </span>
                  </div>

                  <span style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {item.date}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.92rem',
                  color: '#334155',
                  marginTop: '8px',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {simplified}
                </p>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <AudioButton textToSpeak={`${item.title}. ${item.date}. ${simplified}`} size="sm" variant="subtle" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
