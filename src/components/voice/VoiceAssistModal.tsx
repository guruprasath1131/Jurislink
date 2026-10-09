import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Search, X, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';
import { useCase } from '../../context/CaseContext';

interface VoiceAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCnrFound: (cnr: string) => void;
}

export const VoiceAssistModal: React.FC<VoiceAssistModalProps> = ({ isOpen, onClose, onCnrFound }) => {
  const { language, t } = useLanguage();
  const { speak } = useVoice();
  const { lookupCnr, searchCases } = useCase();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceReply, setVoiceReply] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      
      const langCodeMap: Record<string, string> = {
        hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', en: 'en-IN'
      };
      rec.lang = langCodeMap[language] || 'hi-IN';

      rec.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [language]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setVoiceReply('');
      try {
        recognition?.start();
        setIsListening(true);
      } catch {
        // Recognition already active
      }
    }
  };

  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // 1. Try Groq AI Natural Language Voice Processing
    try {
      const { BackendApiService } = await import('../../services/backendApi');
      const aiResult = await BackendApiService.processVoiceQuery(queryText, language);
      if (aiResult && aiResult.voiceReply) {
        setVoiceReply(aiResult.voiceReply);
        speak(aiResult.voiceReply);
        if (aiResult.matchedCnr) {
          onCnrFound(aiResult.matchedCnr);
          return;
        }
      }
    } catch (e) {
      console.warn('AI voice processing error, using fallback:', e);
    }

    const clean = queryText.toLowerCase();
    
    // Check if query mentions a known demo case or CNR
    if (clean.includes('delhi') || clean.includes('land') || clean.includes('farmer') || clean.includes('rameshwar') || clean.includes('8472')) {
      const reply = language === 'hi'
        ? 'रामेश्वर दयाल का ज़मीन का केस मिला। अगली सुनवाई 8 सितंबर 2026 को दिल्ली हाईकोर्ट के कोर्ट रूम 14 में है।'
        : 'Found land compensation case for Rameshwar Dayal. Next hearing is on September 8 in Delhi High Court Room 14.';
      setVoiceReply(reply);
      speak(reply);
      onCnrFound('DLHC01-008472-2024');
    } else if (clean.includes('bombay') || clean.includes('sunita') || clean.includes('shinde') || clean.includes('adjourn') || clean.includes('3921')) {
      const reply = language === 'hi'
        ? 'सुनीता शिंदे का अपील केस मिला। यह केस 24 सितंबर 2026 तक स्थगित किया गया है।'
        : 'Found Sunita Shinde appeal case. This case has been adjourned to September 24.';
      setVoiceReply(reply);
      speak(reply);
      onCnrFound('MCHC01-003921-2023');
    } else if (clean.includes('stay') || clean.includes('electricity') || clean.includes('chennai') || clean.includes('madras') || clean.includes('meenakshi')) {
      const reply = language === 'hi'
        ? 'मद्रास हाईकोर्ट का अंतरिम रोक आदेश मिला। बिजली कनेक्शन सुरक्षित है।'
        : 'Found Madras High Court stay order. Electricity connection remains protected.';
      setVoiceReply(reply);
      speak(reply);
      onCnrFound('TNCH02-014589-2024');
    } else {
      // General search
      const res = await searchCases({ partyName: queryText, caseNumber: queryText });
      if (res.length > 0) {
        const c = res[0];
        const reply = `केस ${c.caseNumber}। अगली तारीख ${c.accessibilitySummary.whenDate}।`;
        setVoiceReply(reply);
        speak(reply);
        onCnrFound(c.cnr);
      } else {
        const reply = language === 'hi'
          ? 'माफ़ कीजिए, आवाज़ से केस नहीं मिला। कृपया सीएनआर नंबर टाइप करें या नोटिस स्कैन करें।'
          : 'Could not find case from voice. Please enter CNR or scan notice.';
        setVoiceReply(reply);
        speak(reply);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(6px)',
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0f172a'
        }}>
          <Sparkles size={28} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {t.navVoiceAssist} (Voice Query)
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Speak your case number, party name, or court in your regional language
          </p>
        </div>

        {/* Big Touch Microphone Button */}
        <button
          onClick={toggleListen}
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: isListening ? '#ef4444' : '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isListening ? '0 0 30px rgba(239, 68, 68, 0.6)' : '0 8px 24px rgba(15, 23, 42, 0.3)',
            transition: 'all 0.3s ease',
            margin: '10px 0'
          }}
        >
          {isListening ? <MicOff size={36} /> : <Mic size={36} color="#f59e0b" />}
        </button>

        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isListening ? '#ef4444' : '#64748b' }}>
          {isListening ? '🎙️ Listening... Speak now (बोलिए)' : 'Tap microphone to speak'}
        </div>

        {/* Live Spoken Speech Display */}
        {transcript && (
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#0f172a'
          }}>
            "{transcript}"
          </div>
        )}

        {/* Voice Assistant Spoken Response Display */}
        {voiceReply && (
          <div style={{
            background: '#eff6ff',
            border: '2px solid #93c5fd',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            fontSize: '0.95rem',
            color: '#1e3a8a',
            lineHeight: 1.5,
            fontWeight: 600
          }}>
            🤖 {voiceReply}
          </div>
        )}

        {/* Quick Voice Prompt Suggestions */}
        <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
            OR TAP A SAMPLE SPOKEN QUERY:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => {
                setTranscript('दिल्ली हाईकोर्ट में रामेश्वर दयाल का केस');
                handleProcessQuery('दिल्ली हाईकोर्ट में रामेश्वर दयाल का केस');
              }}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '8px 12px',
                minHeight: '36px',
                fontSize: '0.85rem',
                justifyContent: 'flex-start'
              }}
            >
              🗣️ "दिल्ली हाईकोर्ट में रामेश्वर दयाल का केस"
            </button>

            <button
              onClick={() => {
                setTranscript('Sunita Shinde case in Bombay High Court');
                handleProcessQuery('Sunita Shinde case in Bombay High Court');
              }}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '8px 12px',
                minHeight: '36px',
                fontSize: '0.85rem',
                justifyContent: 'flex-start'
              }}
            >
              🗣️ "Sunita Shinde case in Bombay High Court"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
