import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Search, X, Edit3 } from 'lucide-react';
import { ExtractedNoticeData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmationModalProps {
  data: ExtractedNoticeData;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmedData: ExtractedNoticeData) => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  data,
  isOpen,
  onClose,
  onConfirm
}) => {
  const { language, t } = useLanguage();
  const [cnr, setCnr] = useState(data.extractedCnr || '');
  const [caseNum, setCaseNum] = useState(data.extractedCaseNumber || '');
  const [court, setCourt] = useState(data.extractedCourtName || '');
  const [date, setDate] = useState(data.extractedHearingDate || '');
  const [parties, setParties] = useState(data.extractedParties || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      ...data,
      extractedCnr: cnr.trim().toUpperCase(),
      extractedCaseNumber: caseNum.trim().toUpperCase(),
      extractedCourtName: court.trim(),
      extractedHearingDate: date.trim(),
      extractedParties: parties.trim()
    });
  };

  const warningText = data.lowConfidenceWarning
    ? (data.lowConfidenceWarning[language] || data.lowConfidenceWarning.en)
    : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              🔍 {t.confirmDetails}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Please verify the details extracted from the notice before looking up the case.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              minHeight: '36px',
              width: '36px',
              padding: 0,
              borderRadius: '50%',
              background: '#f1f5f9',
              color: '#475569'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Confidence Score Pill & Groq AI indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: data.confidenceScore >= 0.8 ? '#ecfdf5' : '#fffbeb',
            border: '1px solid ' + (data.confidenceScore >= 0.8 ? '#a7f3d0' : '#fde68a'),
            color: data.confidenceScore >= 0.8 ? '#065f46' : '#92400e',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {data.confidenceScore >= 0.8 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>AI Extraction Confidence: {Math.round(data.confidenceScore * 100)}%</span>
            </div>
            <span style={{
              background: '#0f172a',
              color: '#38bdf8',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: 800
            }}>
              ⚡ Groq {data.aiModelUsed || 'qwen/qwen3.8-27b'}
            </span>
          </div>

          {/* AI Generated Plain Language Summary preview if available */}
          {data.aiSummary && (data.aiSummary.en || data.aiSummary.hi) && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#334155',
              lineHeight: 1.45
            }}>
              <span style={{ fontWeight: 800, color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                💡 AI Plain-Language Explanation:
              </span>
              <div>{language === 'hi' && data.aiSummary.hi ? data.aiSummary.hi : (data.aiSummary.en || data.aiSummary.hi)}</div>
            </div>
          )}
        </div>

        {/* Low Confidence Warning Alert */}
        {warningText && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            color: '#991b1b',
            lineHeight: 1.5
          }}>
            {warningText}
          </div>
        )}

        {/* Editable Extracted Fields Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
              CNR Number (16 Digits)
            </label>
            <input
              type="text"
              value={cnr}
              onChange={(e) => setCnr(e.target.value)}
              placeholder="e.g. DLHC01-008472-2024"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #cbd5e1',
                fontSize: '1rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#0284c7'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Case Number
              </label>
              <input
                type="text"
                value={caseNum}
                onChange={(e) => setCaseNum(e.target.value)}
                placeholder="e.g. WP(C) 1402/2024"
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                Next Hearing Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
              Court Name
            </label>
            <input
              type="text"
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              placeholder="e.g. High Court of Delhi"
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
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
              Parties (Petitioner vs Respondent)
            </label>
            <input
              type="text"
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              placeholder="e.g. Rameshwar Dayal vs DDA"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '0 16px'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                flex: 2,
                background: '#f59e0b',
                color: '#0f172a',
                padding: '0 20px',
                fontWeight: 800
              }}
            >
              <Search size={18} />
              <span>Confirm & Lookup Case</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
