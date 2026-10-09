import React from 'react';
import { X, ShieldCheck, FileCheck2, Scale, Building2, UserCheck, BookOpen } from 'lucide-react';
import { CourtCase } from '../../types';

interface OfficialDataDrawerProps {
  caseData: CourtCase;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDataDrawer: React.FC<OfficialDataDrawerProps> = ({ caseData, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '620px',
        height: '100%',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={24} color="#0284c7" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Authoritative Official Court Record
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              Directly fetched from National Judicial Data Grid (NJDG) / eCourts Services
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              minHeight: '40px',
              padding: 0,
              borderRadius: '50%',
              background: '#f1f5f9',
              color: '#475569'
            }}
            aria-label="Close Official Data"
          >
            <X size={20} />
          </button>
        </div>

        {/* Official Authority Banner */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          fontSize: '0.85rem',
          color: '#1e40af',
          lineHeight: 1.5
        }}>
          <strong>AUTHORITATIVE NOTICE:</strong> This raw record contains unchanged judicial filings, sections, and orders as registered in the court management database. Jurislink does not modify any legal facts.
        </div>

        {/* Case Identifiers Grid */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Case Identification
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>CNR Number</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#0284c7' }}>{caseData.cnr}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Case Number</span>
              <strong style={{ color: '#0f172a' }}>{caseData.caseNumber}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Filing Date</span>
              <span>{caseData.filingDate}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase' }}>Registration Date</span>
              <span>{caseData.registrationDate}</span>
            </div>
          </div>
        </div>

        {/* Court & Bench */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={18} color="#0f172a" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Court & Bench Information
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
            <div><strong>Court:</strong> {caseData.courtName}</div>
            <div><strong>Complex:</strong> {caseData.courtComplex}</div>
            <div><strong>Court Room:</strong> {caseData.courtRoomNumber}</div>
            <div><strong>Judicial Officer / Bench:</strong> {caseData.judgeName}</div>
            <div><strong>State / District:</strong> {caseData.district}, {caseData.state}</div>
          </div>
        </div>

        {/* Parties & Advocates */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius-md)',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <UserCheck size={18} color="#0f172a" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Parties & Advocates
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                {caseData.petitioner.type} (वादी / याचिकाकर्ता)
              </span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{caseData.petitioner.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Advocate: {caseData.petitioner.advocate || 'In-Person'}</div>
            </div>

            <div style={{ padding: '8px 12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                {caseData.respondent.type} (प्रतिवादी)
              </span>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{caseData.respondent.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Advocate: {caseData.respondent.advocate || 'Standing Counsel'}</div>
            </div>
          </div>
        </div>

        {/* Acts & Sections */}
        {caseData.actsAndSections && caseData.actsAndSections.length > 0 && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BookOpen size={18} color="#0f172a" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Acts & Statutory Sections
              </h3>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: '#334155' }}>
              {caseData.actsAndSections.map((act, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{act}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw Orders */}
        {caseData.orders && caseData.orders.length > 0 && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Official Signed Judicial Orders
            </h3>
            {caseData.orders.map((ord, idx) => (
              <div key={idx} style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                  <strong>{ord.orderType} ({ord.orderNumber})</strong>
                  <span>{ord.date}</span>
                </div>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  background: '#f1f5f9',
                  padding: '10px',
                  borderRadius: '4px',
                  color: '#0f172a',
                  lineHeight: 1.4
                }}>
                  {ord.rawText}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
