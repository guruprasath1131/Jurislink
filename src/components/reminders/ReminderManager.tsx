import React, { useState, useEffect } from 'react';
import { Bell, Send, CheckCircle2, Clock, Phone, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ReminderService } from '../../services/reminderService';
import { ReminderPreference, CourtCase } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useCase } from '../../context/CaseContext';

export const ReminderManager: React.FC = () => {
  const { language, t } = useLanguage();
  const { activeCase } = useCase();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [remindDays, setRemindDays] = useState<number[]>([7, 3, 1, 0]);
  const [preferences, setPreferences] = useState<ReminderPreference[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [rescheduleSimulationMsg, setRescheduleSimulationMsg] = useState<string | null>(null);

  useEffect(() => {
    setPreferences(ReminderService.getPreferences());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const pref = ReminderService.setupRemindersForCase(activeCase, cleanPhone, language, remindDays);
    setPreferences(ReminderService.getPreferences());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleToggleDay = (day: number) => {
    if (remindDays.includes(day)) {
      setRemindDays(remindDays.filter(d => d !== day));
    } else {
      setRemindDays([...remindDays, day].sort((a, b) => b - a));
    }
  };

  const handleSimulateAdjournment = () => {
    if (!activeCase) return;
    const existing = preferences.find(p => p.cnr === activeCase.cnr);
    if (!existing) {
      alert('Please activate SMS alerts for this case first.');
      return;
    }

    const newHearingDate = '2026-10-18';
    const updated = ReminderService.handleHearingDateRescheduled(existing, activeCase, newHearingDate);
    setPreferences(ReminderService.getPreferences());
    setRescheduleSimulationMsg(`Adjournment detected: Old pending reminders cancelled. New "Hearing Rescheduled to ${newHearingDate}" alert scheduled without duplicate notices.`);
    setTimeout(() => setRescheduleSimulationMsg(null), 6000);
  };

  const currentCasePref = activeCase ? preferences.find(p => p.cnr === activeCase.cnr) : null;
  const previewSms = activeCase ? ReminderService.generateRegionalSms(activeCase, language, 3) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card-elevated">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t.reminderSettings}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Free proactive regional-language SMS hearing notifications for feature phones and smartphones
            </p>
          </div>
        </div>

        {activeCase ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>ACTIVE CASE SELECTED</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{activeCase.caseNumber} ({activeCase.cnr})</div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Next Hearing Date: <strong>{activeCase.accessibilitySummary.whenDate}</strong></div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Enter Citizen Mobile Number (मोबाइल नंबर)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9876543210"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '2px solid #cbd5e1',
                    fontSize: '1rem',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Select Proactive Reminder Intervals (कब-कब एसएमएस पाना चाहते हैं?)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { d: 7, label: '7 Days Before' },
                  { d: 3, label: '3 Days Before' },
                  { d: 1, label: '1 Day Before (कल)' },
                  { d: 0, label: 'Morning of Hearing (आज)' }
                ].map(({ d, label }) => {
                  const isChecked = remindDays.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => handleToggleDay(d)}
                      style={{
                        background: isChecked ? '#0284c7' : '#ffffff',
                        color: isChecked ? '#ffffff' : '#334155',
                        border: isChecked ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        minHeight: '38px'
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '} {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Regional SMS Preview */}
            <div style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                <Send size={14} color="#0284c7" />
                <span>SAMPLE SMS PREVIEW IN {language.toUpperCase()}</span>
              </div>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.9rem',
                color: '#0f172a',
                fontFamily: 'monospace',
                lineHeight: 1.5
              }}>
                {previewSms}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: '#f59e0b',
                  color: '#0f172a',
                  padding: '0 20px',
                  fontWeight: 800
                }}
              >
                <CheckCircle2 size={18} />
                <span>{t.saveReminders}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateAdjournment}
                style={{
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '0 16px',
                  fontSize: '0.85rem'
                }}
                title="Test how Jurislink automatically handles court adjournment without stale duplicate SMS"
              >
                🔄 Test Adjournment Reschedule
              </button>
            </div>

            {savedSuccess && (
              <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                ✅ Proactive SMS reminders activated for +91 {phoneNumber.slice(-10)}!
              </div>
            )}

            {rescheduleSimulationMsg && (
              <div style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {rescheduleSimulationMsg}
              </div>
            )}
          </form>
        ) : (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
            Please select or lookup a case to configure reminders.
          </div>
        )}
      </div>

      {/* Scheduled Reminders Queue */}
      {currentCasePref && (
        <div className="card-elevated">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            📅 Active Reminder Dispatch Queue for this Case
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentCasePref.scheduledReminders.map((rem, idx) => (
              <div key={idx} style={{
                background: rem.status === 'CANCELLED' ? '#fef2f2' : '#f8fafc',
                border: '1px solid ' + (rem.status === 'CANCELLED' ? '#fecaca' : '#e2e8f0'),
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                    {rem.type === 'HEARING_REMINDER' ? '🔔 Scheduled Hearing Reminder' : (rem.type === 'RESCHEDULE_ALERT' ? '⚠️ Reschedule Alert' : 'Order Alert')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Scheduled Dispatch Date: {rem.scheduledDate}
                  </div>
                </div>

                <span style={{
                  background: rem.status === 'CANCELLED' ? '#fee2e2' : '#ecfdf5',
                  color: rem.status === 'CANCELLED' ? '#991b1b' : '#047857',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {rem.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
