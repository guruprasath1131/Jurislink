import React from 'react';
import { Volume2, Square } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label,
  size = 'md',
  variant = 'primary',
  className = ''
}) => {
  const { isSpeaking, speak, stop } = useVoice();
  const { t } = useLanguage();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(textToSpeak);
    }
  };

  const sizeStyles = {
    sm: { height: '38px', padding: '0 12px', fontSize: '0.875rem' },
    md: { height: '48px', padding: '0 18px', fontSize: '1rem' },
    lg: { height: '56px', padding: '0 24px', fontSize: '1.125rem' }
  }[size];

  const variantStyles = {
    primary: {
      background: isSpeaking ? '#ef4444' : '#1e293b',
      color: '#ffffff',
      border: 'none',
      boxShadow: 'var(--shadow-sm)'
    },
    accent: {
      background: isSpeaking ? '#ef4444' : '#f59e0b',
      color: isSpeaking ? '#ffffff' : '#0f172a',
      border: 'none',
      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
    },
    secondary: {
      background: isSpeaking ? '#fee2e2' : '#e0f2fe',
      color: isSpeaking ? '#dc2626' : '#0369a1',
      border: '1px solid currentColor'
    },
    subtle: {
      background: isSpeaking ? '#fee2e2' : '#f1f5f9',
      color: isSpeaking ? '#dc2626' : '#334155',
      border: '1px solid var(--border-color)'
    }
  }[variant];

  return (
    <button
      onClick={handleToggle}
      aria-label={isSpeaking ? t.stopAudio : (label || t.hearAudio)}
      style={{
        ...sizeStyles,
        ...variantStyles,
        borderRadius: 'var(--radius-md)',
        fontWeight: 700
      }}
      className={className}
      title={isSpeaking ? t.stopAudio : t.hearAudio}
    >
      {isSpeaking ? (
        <>
          <Square size={size === 'lg' ? 22 : 18} fill="currentColor" />
          <span>{t.stopAudio}</span>
          <div style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', marginLeft: '4px' }}>
            <div className="wave-bar" style={{ height: '14px' }}></div>
            <div className="wave-bar" style={{ height: '20px' }}></div>
            <div className="wave-bar" style={{ height: '12px' }}></div>
          </div>
        </>
      ) : (
        <>
          <Volume2 size={size === 'lg' ? 24 : 20} />
          <span>{label || t.hearAudio}</span>
        </>
      )}
    </button>
  );
};
