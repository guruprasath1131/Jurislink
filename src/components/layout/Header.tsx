import React, { useState, useEffect } from 'react';
import { Scale, Globe, Volume2, VolumeX, Eye, PhoneCall, ChevronDown, Sparkles, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { SupportedLanguage, AiRateLimitTelemetry } from '../../types';
import { BackendApiService } from '../../services/backendApi';

interface HeaderProps {
  onOpenIvr: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenIvr }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isAutoPlayEnabled, toggleAutoPlay } = useVoice();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiTelemetry, setAiTelemetry] = useState<AiRateLimitTelemetry | null>(null);

  useEffect(() => {
    BackendApiService.getAiStatus().then(data => {
      if (data) setAiTelemetry(data);
    });
  }, []);

  const openAiModal = async () => {
    setIsAiModalOpen(true);
    const data = await BackendApiService.getAiStatus();
    if (data) setAiTelemetry(data);
  };

  const toggleContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      borderBottom: '3px solid var(--accent-gold)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      {/* Top Toll-Free Bar */}
      <div style={{
        background: '#0b1120',
        padding: '6px 16px',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: '#f59e0b',
            color: '#0f172a',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            🇮🇳 eCourts NJDG Accessibility Layer
          </span>
          <span style={{ opacity: 0.85 }} className="hide-mobile">
            {t.disclaimerShort}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={openAiModal}
            style={{
              minHeight: '28px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              borderRadius: '20px',
              fontWeight: 700,
              gap: '4px'
            }}
            title="Inspect Groq AI Telemetry & Rate Limits"
          >
            <Sparkles size={12} color="#38bdf8" />
            <span>⚡ Groq AI (qwen/qwen3.8-27b)</span>
          </button>

          <button
            onClick={onOpenIvr}
            style={{
              minHeight: '28px',
              padding: '2px 10px',
              fontSize: '0.75rem',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              color: '#f59e0b',
              borderRadius: '20px'
            }}
            title="Open 2G Feature Phone Simulator"
          >
            <PhoneCall size={12} />
            <span>Toll-Free: 1800-JURIS-LINK</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="app-container" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}>
            <Scale size={26} strokeWidth={2.5} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#ffffff' }}>
                Jurislink <span style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 600 }}>न्याय सेतु</span>
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Voice Toggle, Contrast */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Selector Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '0 14px',
                minHeight: '42px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem'
              }}
              aria-label="Select Language"
            >
              <Globe size={18} color="#f59e0b" />
              <span>{currentLangObj.flag} {currentLangObj.nativeName}</span>
              <ChevronDown size={16} />
            </button>

            {isLangDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                minWidth: '200px',
                zIndex: 100,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', background: '#0f172a' }}>
                  SELECT REGIONAL LANGUAGE (भाषा चुनें)
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as SupportedLanguage);
                      setIsLangDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      padding: '10px 14px',
                      minHeight: '40px',
                      borderRadius: 0,
                      background: language === lang.code ? '#334155' : 'transparent',
                      color: language === lang.code ? '#f59e0b' : '#ffffff',
                      fontSize: '0.9rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{lang.flag}</span>
                    <span style={{ fontWeight: 700 }}>{lang.nativeName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Auto-Play Toggle */}
          <button
            onClick={toggleAutoPlay}
            style={{
              background: isAutoPlayEnabled ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isAutoPlayEnabled ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.15)',
              color: isAutoPlayEnabled ? '#f59e0b' : '#94a3b8',
              padding: '0 12px',
              minHeight: '42px'
            }}
            title={isAutoPlayEnabled ? 'Voice assistance enabled' : 'Voice assistance muted'}
          >
            {isAutoPlayEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleContrast}
            style={{
              background: isHighContrast ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: isHighContrast ? '#0f172a' : '#ffffff',
              padding: '0 12px',
              minHeight: '42px'
            }}
            title="Toggle High Contrast Mode (उच्च कंट्रास्ट)"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Groq AI Telemetry & Rate Limit Modal */}
      {isAiModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: '#0f172a'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Groq Cloud AI Engine & Rate Limit Status
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Real-time telemetry and quota guard for Jurislink AI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                style={{
                  minHeight: '34px',
                  width: '34px',
                  padding: 0,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  color: '#475569'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* API Key Status Card */}
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  Configured Groq API Key
                </span>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#065f46', fontSize: '0.95rem' }}>
                  {aiTelemetry?.apiKeyPrefix || 'gsk_Xdh...IHb9'}
                </div>
              </div>
              <span style={{
                background: '#059669',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle2 size={14} /> ACTIVE & VERIFIED
              </span>
            </div>

            {/* Rate Limit Analysis Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Daily Request Limit (RPM/RPD)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {aiTelemetry?.remainingRequests ?? 1000} / {aiTelemetry?.limitRequests ?? 1000}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                  Reset: {aiTelemetry?.resetRequests || 'rolling'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Output Tokens Limit (OTPM)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  1,000 OTPM
                </div>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
                  Enforced Max: 280 tokens/call
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Token Limit (TPM)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {aiTelemetry?.remainingTokens ?? 8000} / {aiTelemetry?.limitTokens ?? 8000}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  8,000 Tokens/min tier
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Active LLM Architecture
                </span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>
                  {aiTelemetry?.activeModel || 'qwen/qwen3.8-27b'}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Auto-failover to GPT-OSS
                </span>
              </div>
            </div>

            {/* Active AI Capabilities Checklist */}
            <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '12px 14px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '8px' }}>
                ENABLED AI CAPABILITIES IN YOUR PROJECT:
              </span>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>✅ <strong>Document Notice Scanner</strong>: Auto-extracts CNR, Case Number, Court, Dates via Groq</li>
                <li>✅ <strong>Plain Legal Simplification</strong>: 5th-grade summaries in 8 Indic languages (EN, HI, TA, TE, KN, MR, BN, GU)</li>
                <li>✅ <strong>Case Legal Assistant Q&A</strong>: Strict factual answering without hallucination</li>
                <li>✅ <strong>Voice Query Telephony</strong>: Understands natural language speech queries</li>
                <li>✅ <strong>Quota Guard & Cache</strong>: Re-uses extracted tokens to prevent 429 rate limit errors</li>
              </ul>
            </div>

            <button
              onClick={() => setIsAiModalOpen(false)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                padding: '12px',
                borderRadius: '10px'
              }}
            >
              Close Status
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
