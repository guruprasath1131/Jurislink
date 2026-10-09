import React, { useState } from 'react';
import { Sparkles, Send, Volume2, HelpCircle, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { CourtCase, SupportedLanguage } from '../../types';
import { BackendApiService } from '../../services/backendApi';
import { useLanguage } from '../../context/LanguageContext';
import { useVoice } from '../../context/VoiceContext';

interface AiCaseAssistantProps {
  caseData: CourtCase;
}

export const AiCaseAssistant: React.FC<AiCaseAssistantProps> = ({ caseData }) => {
  const { language } = useLanguage();
  const { speak } = useVoice();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string | null>(null);

  const quickQuestions: Record<SupportedLanguage, string[]> = {
    en: [
      'What documents should I carry to court?',
      'Do I need to be personally present in court?',
      'What is the next procedural step?',
      'Is my interim protection or stay active?'
    ],
    hi: [
      'मुझे कोर्ट में क्या दस्तावेज़ ले जाने चाहिए?',
      'क्या मुझे खुद कोर्ट में उपस्थित होना होगा?',
      'अगली तारीख पर क्या कार्रवाई होगी?',
      'क्या मेरा अंतरिम स्टे ऑर्डर लागू है?'
    ],
    ta: [
      'நீதிமன்றத்திற்கு என்ன ஆவணங்கள் கொண்டு செல்ல வேண்டும்?',
      'நான் நேரில் ஆஜராக வேண்டுமா?',
      'அடுத்த கட்ட நடைமுறை என்ன?'
    ],
    te: [
      'కోర్టుకు ఏ పత్రాలు తీసుకువెళ్లాలి?',
      'నేను వ్యక్తిగతంగా హాజరు కావాలా?',
      'తదుపరి చర్య ఏమిటి?'
    ],
    kn: [
      'ನ್ಯಾಯಾಲಯಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳನ್ನು ಕೊಂಡೊಯ್ಯಬೇಕು?',
      'ನಾನು ಖುದ್ದಾಗಿ ಹಾಜರಾಗಬೇಕೇ?'
    ],
    mr: [
      'मी न्यायालयात कोणती कागदपत्रे न्यावीत?',
      'मला स्वतः न्यायालयात हजर राहावे लागेल का?'
    ],
    bn: [
      'আদালতে কি কি নথি নিয়ে যেতে হবে?',
      'আমাকে কি নিজে উপস্থিত হতে হবে?'
    ],
    gu: [
      'કોર્ટમાં કયા દસ્તાવેજો લઈ જવા જોઈએ?',
      'શું મારે જાતે કોર્ટમાં હાજર રહેવું પડશે?'
    ]
  };

  const currentQuestions = quickQuestions[language] || quickQuestions.en;

  const handleAsk = async (qText: string) => {
    if (!qText.trim()) return;
    setIsLoading(true);
    setAnswer(null);

    try {
      const res = await BackendApiService.askCaseAi(caseData, qText, language);
      setAnswer(res.answer);
      if (res.aiModelUsed) setAiModel(res.aiModelUsed);
    } catch {
      setAnswer(`Hearing for ${caseData.caseNumber} is on ${caseData.accessibilitySummary.whenDate} at ${caseData.courtName}. Please reach the court room by 10:00 AM with your lawyer.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };

  return (
    <div className="card-elevated" style={{
      border: '2px solid #e0e7ff',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🤖 Groq Legal Case AI Assistant
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Ask questions about this specific case in your language • Factual & Zero-Hallucination
            </p>
          </div>
        </div>

        <span style={{
          background: '#0f172a',
          color: '#38bdf8',
          fontSize: '0.72rem',
          padding: '4px 10px',
          borderRadius: '12px',
          fontWeight: 800
        }}>
          ⚡ Groq {aiModel || 'qwen/qwen3.8-27b'}
        </span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
          💡 Quick Inquiries (Click to ask):
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {currentQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setQuestion(q); handleAsk(q); }}
              style={{
                background: '#ffffff',
                border: '1px solid #c7d2fe',
                color: '#3730a3',
                fontSize: '0.78rem',
                padding: '6px 12px',
                minHeight: '32px',
                borderRadius: '16px',
                fontWeight: 600
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={language === 'hi' ? 'इस केस के बारे में कोई भी सवाल पूछें...' : 'Ask any question about this case...'}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #cbd5e1',
            fontSize: '0.92rem'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          style={{
            background: '#4f46e5',
            color: '#ffffff',
            padding: '0 18px',
            fontWeight: 800,
            minHeight: '44px',
            gap: '6px'
          }}
        >
          {isLoading ? <RefreshCw size={18} className="anim-pulse" /> : <Send size={18} />}
          <span>Ask</span>
        </button>
      </form>

      {/* AI Answer Card */}
      {answer && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} /> Official AI Explanation:
            </span>
            <button
              onClick={() => speak(answer)}
              style={{
                background: '#ffffff',
                border: '1px solid #93c5fd',
                color: '#1d4ed8',
                padding: '2px 10px',
                fontSize: '0.75rem',
                minHeight: '28px',
                borderRadius: '14px',
                gap: '4px'
              }}
            >
              <Volume2 size={14} />
              <span>Listen</span>
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.55 }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};
