import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneOff, Volume2, Globe, Shield, Terminal, RefreshCw, MessageSquare } from 'lucide-react';
import { IvrService, IvrPrompt } from '../../services/ivrService';
import { IvrCallState, SupportedLanguage, CourtCase } from '../../types';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';
import { TtsService } from '../../services/ttsService';

export const IvrSimulator: React.FC = () => {
  const { playTone, speak, stop } = useVoice();
  const { language } = useLanguage();
  const [isInCall, setIsInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [callState, setCallState] = useState<IvrCallState>(IvrService.createInitialCallState());
  const [currentPrompt, setCurrentPrompt] = useState<IvrPrompt>(IvrService.getLanguagePrompt());
  const [lastFetchedCase, setLastFetchedCase] = useState<CourtCase | null>(null);
  const [activeTab, setActiveTab] = useState<'PHONE' | 'WEBHOOK'>('PHONE');

  const startCall = async () => {
    setIsRinging(true);
    await TtsService.playRingTone();
    setIsRinging(false);
    setIsInCall(true);

    const initial = IvrService.createInitialCallState();
    const prompt = IvrService.getLanguagePrompt();
    setCallState(initial);
    setCurrentPrompt(prompt);
    speak(prompt.speechText);
  };

  const endCall = () => {
    stop();
    setIsInCall(false);
    setIsRinging(false);
  };

  const handleKeyPress = async (key: string) => {
    playTone(key);

    if (!isInCall) return;

    const { nextState, prompt, caseData } = await IvrService.processInput(
      callState,
      key,
      (text, lang) => {
        speak(text);
      }
    );

    setCallState(nextState);
    setCurrentPrompt(prompt);
    if (caseData) {
      setLastFetchedCase(caseData);
    }
  };

  const twilioPayload = IvrService.generateTwilioTwiML(currentPrompt, callState.selectedLanguage);
  const exotelPayload = JSON.stringify(IvrService.generateExotelResponse(currentPrompt), null, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div className="card-elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PhoneCall size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                2G Feature-Phone IVR Telephony System
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Toll-Free Helpline 1800-JURIS-LINK (1800-587-4754) for basic keypad phones
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('PHONE')}
              style={{
                background: activeTab === 'PHONE' ? '#0f172a' : '#f1f5f9',
                color: activeTab === 'PHONE' ? '#ffffff' : '#334155',
                padding: '6px 14px',
                minHeight: '36px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              📱 Handset Simulator
            </button>

            <button
              onClick={() => setActiveTab('WEBHOOK')}
              style={{
                background: activeTab === 'WEBHOOK' ? '#0f172a' : '#f1f5f9',
                color: activeTab === 'WEBHOOK' ? '#ffffff' : '#334155',
                padding: '6px 14px',
                minHeight: '36px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <Terminal size={14} />
              <span>PBX Webhooks (Twilio/Exotel)</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'PHONE' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Feature Phone Physical Handset Frame */}
          <div style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '32px',
            padding: '24px 20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
            border: '4px solid #334155',
            maxWidth: '360px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Earpiece Grill */}
            <div style={{
              width: '50px',
              height: '4px',
              background: '#475569',
              borderRadius: '2px',
              margin: '0 auto'
            }} />

            {/* Feature Phone Monochrome / Color LCD Screen */}
            <div style={{
              background: isInCall ? '#034e32' : '#0f241a',
              border: '3px solid #1e3a2b',
              borderRadius: '12px',
              padding: '14px',
              minHeight: '160px',
              color: '#a7f3d0',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
            }}>
              {/* Screen Top Status Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderBottom: '1px solid rgba(167, 243, 208, 0.3)', paddingBottom: '4px' }}>
                <span>📶 2G GSM AIRTEL</span>
                <span>{isInCall ? '🔊 CALL ACTIVE' : (isRinging ? '📞 DIALING...' : 'STANDBY')}</span>
                <span>🔋 100%</span>
              </div>

              {/* Screen Body Content */}
              <div style={{ margin: '10px 0', fontSize: '0.85rem', lineHeight: 1.4 }}>
                {isRinging && (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Dialing 1800-JURIS-LINK...</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Toll-Free Indian Legal Aid Gate</div>
                  </div>
                )}

                {isInCall && (
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '4px' }}>
                      LANGUAGE: {callState.selectedLanguage.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>
                      {currentPrompt.displayMenu}
                    </div>
                  </div>
                )}

                {!isInCall && !isRinging && (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>1800-587-4754</div>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '4px' }}>
                      Press Green Call Button to Connect
                    </div>
                  </div>
                )}
              </div>

              {/* Screen Bottom Menu */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', borderTop: '1px solid rgba(167, 243, 208, 0.3)', paddingTop: '4px' }}>
                <span>Menu</span>
                <span>1800-JURIS</span>
                <span>Exit</span>
              </div>
            </div>

            {/* Call Control Action Buttons (Green & Red) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={startCall}
                disabled={isInCall || isRinging}
                style={{
                  background: isInCall ? '#064e3b' : '#10b981',
                  color: '#ffffff',
                  minHeight: '44px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                <PhoneCall size={18} />
                <span>Call</span>
              </button>

              <button
                onClick={endCall}
                disabled={!isInCall && !isRinging}
                style={{
                  background: isInCall ? '#ef4444' : '#7f1d1d',
                  color: '#ffffff',
                  minHeight: '44px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
                }}
              >
                <PhoneOff size={18} />
                <span>End</span>
              </button>
            </div>

            {/* 3x4 Tactile Keypad */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              background: '#0b1120',
              padding: '12px',
              borderRadius: '20px',
              border: '1px solid #1e293b'
            }}>
              {[
                { k: '1', sub: '.,' }, { k: '2', sub: 'ABC' }, { k: '3', sub: 'DEF' },
                { k: '4', sub: 'GHI' }, { k: '5', sub: 'JKL' }, { k: '6', sub: 'MNO' },
                { k: '7', sub: 'PQRS' }, { k: '8', sub: 'TUV' }, { k: '9', sub: 'WXYZ' },
                { k: '*', sub: '' }, { k: '0', sub: '+' }, { k: '#', sub: '' }
              ].map(({ k, sub }) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  style={{
                    background: 'linear-gradient(180deg, #334155, #1e293b)',
                    color: '#ffffff',
                    minHeight: '46px',
                    borderRadius: '12px',
                    flexDirection: 'column',
                    padding: '4px',
                    gap: 0,
                    boxShadow: '0 3px 0 #0f172a, inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    border: '1px solid #475569'
                  }}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>{k}</span>
                  {sub && <span style={{ fontSize: '0.6rem', color: '#94a3b8', letterSpacing: '0.05em' }}>{sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Live Voice Log & Audio Subtitles */}
          <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Live Voice Call Transcript
                </h3>
              </div>
              <span style={{
                background: isInCall ? '#ecfdf5' : '#f1f5f9',
                color: isInCall ? '#047857' : '#64748b',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {isInCall ? 'LIVE CALL STREAM' : 'CALL IDLE'}
              </span>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '4px'
            }}>
              {callState.audioLog.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 10px', fontSize: '0.9rem' }}>
                  Press the Green Call button on the handset to start hearing the interactive IVR in your language.
                </div>
              ) : (
                callState.audioLog.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: log.speaker === 'IVR' ? '#eff6ff' : '#f1f5f9',
                      borderLeft: log.speaker === 'IVR' ? '4px solid #0284c7' : '4px solid #f59e0b',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                      <strong>{log.speaker === 'IVR' ? '🔊 IVR Voice Assistant' : '👤 Caller (You)'}</strong>
                      <span>{log.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, color: '#0f172a', fontWeight: log.speaker === 'IVR' ? 600 : 700 }}>
                      {log.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Telephony Webhook Inspector (Twilio / Exotel) */
        <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Telephony Webhook Integration Endpoints
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Both the web application and 2G IVR telephony run on the same unified Case Services backend.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7', display: 'block', marginBottom: '6px' }}>
                TWILIO TWIML XML WEBHOOK RESPONSE (/api/ivr/webhook)
              </span>
              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                overflowX: 'auto',
                lineHeight: 1.4
              }}>
                {twilioPayload}
              </pre>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', display: 'block', marginBottom: '6px' }}>
                EXOTEL INDIAN CLOUD TELEPHONY JSON (/api/ivr/exotel)
              </span>
              <pre style={{
                background: '#0f172a',
                color: '#4ade80',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                overflowX: 'auto',
                lineHeight: 1.4
              }}>
                {exotelPayload}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
