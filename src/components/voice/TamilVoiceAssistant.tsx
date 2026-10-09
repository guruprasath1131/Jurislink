import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Volume2, VolumeX, Sparkles, Send, RotateCcw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────────── */
type AssistLang = 'ta' | 'hi' | 'en';

interface ConvMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  matchedCnr?: string | null;
}

interface TamilVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCnrFound?: (cnr: string) => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Language configs
───────────────────────────────────────────────────────────────────────────── */
const LANG_CONFIG: Record<AssistLang, {
  label: string;
  bcp47: string;
  greeting: string;
  listenHint: string;
  placeholder: string;
  thinkingMsg: string;
  tapToSpeak: string;
  speaking: string;
}> = {
  ta: {
    label: 'தமிழ்',
    bcp47: 'ta-IN',
    greeting: 'வணக்கம்! நான் ஜூரிஸ்லிங்க் சட்ட உதவியாளர். உங்கள் நீதிமன்ற வழக்கு பற்றி என்ன அறிய விரும்புகிறீர்கள்? CNR எண் அல்லது கட்சியின் பெயர் சொல்லுங்கள்.',
    listenHint: '🎙️ பேசுங்கள்... (Speak in Tamil)',
    placeholder: 'தமிழில் தட்டச்சு செய்யுங்கள்...',
    thinkingMsg: '🤔 யோசிக்கிறேன்...',
    tapToSpeak: '👆 பேச அழுத்துங்கள் அல்லது தட்டச்சு செய்யுங்கள்',
    speaking: '🔊 பதில் சொல்கிறேன்...'
  },
  hi: {
    label: 'हिंदी',
    bcp47: 'hi-IN',
    greeting: 'नमस्ते! मैं जूरिसलिंक का क़ानूनी सहायक हूं। अपने केस के बारे में क्या जानना चाहते हैं? CNR नंबर या पार्टी का नाम बताइए।',
    listenHint: '🎙️ बोलिए... (Speak in Hindi)',
    placeholder: 'हिंदी में टाइप करें...',
    thinkingMsg: '🤔 सोच रहा हूं...',
    tapToSpeak: '👆 बोलने के लिए दबाएं या टाइप करें',
    speaking: '🔊 जवाब दे रहा हूं...'
  },
  en: {
    label: 'English',
    bcp47: 'en-IN',
    greeting: "Hello! I'm your Jurislink Legal Assistant. What would you like to know about your court case? Please tell me your CNR number or party name.",
    listenHint: '🎙️ Speak now...',
    placeholder: 'Type your question...',
    thinkingMsg: '🤔 Thinking...',
    tapToSpeak: '👆 Tap microphone to speak or type below',
    speaking: '🔊 Speaking reply...'
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

let activeAudio: HTMLAudioElement | null = null;

function stopAllAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }
}

async function ttsSpeak(text: string, lang: AssistLang): Promise<void> {
  stopAllAudio();

  // Sanitize text for clean spoken pronunciation
  const clean = text
    .replace(/[*#_~`>•-]/g, ' ')
    .replace(/\([A-Za-z0-9\s]+\)/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return;

  // 1. Primary: High-Definition Natural Audio Stream from server endpoint
  try {
    const audioUrl = `/api/ai/tts-audio?text=${encodeURIComponent(clean)}&lang=${lang}`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null;
        resolve();
      };
      audio.onerror = (e) => {
        if (activeAudio === audio) activeAudio = null;
        reject(e);
      };
      audio.play().catch(reject);
    });
    return;
  } catch (audioErr) {
    console.warn('[Natural Indic Audio Fallback to Web Speech]', audioErr);
  }

  // 2. Fallback: Browser Web Speech API with calibrated parameters
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    const bcp = LANG_CONFIG[lang].bcp47;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      if (lang === 'ta') {
        return l.startsWith('ta') || n.includes('tamil') || n.includes('தமிழ்') || n.includes('valluvar');
      }
      return l.startsWith(bcp.split('-')[0].toLowerCase());
    }) || null;

    if (voice) { utter.voice = voice; utter.lang = voice.lang; }
    else { utter.lang = bcp; }
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export const TamilVoiceAssistant: React.FC<TamilVoiceAssistantProps> = ({ isOpen, onClose, onCnrFound }) => {
  const [lang, setLang] = useState<AssistLang>('ta');
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hasInit, setHasInit] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const pulseIntervalRef = useRef<any>(null);
  const liveTranscriptRef = useRef('');

  const startPulse = useCallback(() => {
    let lvl = 0; let dir = 1;
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseIntervalRef.current = setInterval(() => {
      lvl += dir * 9;
      if (lvl >= 100) dir = -1;
      if (lvl <= 0) dir = 1;
      setPulseLevel(lvl);
    }, 65);
  }, []);

  const stopPulse = useCallback(() => {
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    pulseIntervalRef.current = null;
    setPulseLevel(0);
  }, []);

  useEffect(() => { liveTranscriptRef.current = liveTranscript; }, [liveTranscript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      stopPulse();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    }
  }, [isOpen, stopPulse]);

  // Init greeting when opened
  useEffect(() => {
    if (isOpen && !hasInit) {
      setHasInit(true);
      const greeting = LANG_CONFIG[lang].greeting;
      const greetMsg: ConvMessage = {
        id: uid(), role: 'assistant', content: greeting, timestamp: new Date()
      };
      setMessages([greetMsg]);
      historyRef.current = [{ role: 'assistant', content: greeting }];
      setTimeout(async () => {
        if (!isMuted) {
          setIsSpeaking(true);
          startPulse();
          await ttsSpeak(greeting, lang);
          stopPulse();
          setIsSpeaking(false);
        }
      }, 600);
    }
  }, [isOpen, hasInit, lang, isMuted, startPulse, stopPulse]);

  const switchLanguage = (newLang: AssistLang) => {
    stopAllAudio();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setLang(newLang);
    setMessages([]);
    setHasInit(false);
    historyRef.current = [];
    setLiveTranscript('');
    setTextInput('');
    setIsListening(false);
    setIsSpeaking(false);
    setIsThinking(false);
    stopPulse();
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userMsg: ConvMessage = { id: uid(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    setLiveTranscript('');
    setTextInput('');
    historyRef.current = [...historyRef.current, { role: 'user', content: text.trim() }];

    try {
      const res = await fetch('/api/ai/tamil-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: historyRef.current.slice(-10),
          language: lang
        })
      });

      const fallbacks: Record<AssistLang, string> = {
        ta: 'மன்னிக்கவும், இப்போது பதில் கொடுக்க முடியவில்லை. கொஞ்சம் நேரம் கழித்து முயற்சிக்கவும்.',
        hi: 'माफ़ कीजिए, अभी जवाब नहीं दे सकता। थोड़ी देर बाद कोशिश करें।',
        en: 'Sorry, could not respond right now. Please try again shortly.'
      };

      let reply = fallbacks[lang];
      let matchedCnr: string | null = null;
      if (res.ok) {
        const data = await res.json();
        reply = data.reply || reply;
        matchedCnr = data.matchedCnr || null;
      }

      const assistMsg: ConvMessage = { id: uid(), role: 'assistant', content: reply, timestamp: new Date(), matchedCnr };
      setMessages(prev => [...prev, assistMsg]);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];

      if (matchedCnr && onCnrFound) onCnrFound(matchedCnr);

      if (!isMuted) {
        setIsSpeaking(true);
        startPulse();
        await ttsSpeak(reply, lang);
        stopPulse();
        setIsSpeaking(false);
      }
    } catch {
      const errFallbacks: Record<AssistLang, string> = {
        ta: 'சேவை இல்லை. இணைப்பு சரிபார்க்கவும்.',
        hi: 'सेवा उपलब्ध नहीं। कनेक्शन जांचें।',
        en: 'Service unavailable. Check your connection.'
      };
      setMessages(prev => [...prev, { id: uid(), role: 'assistant', content: errFallbacks[lang], timestamp: new Date() }]);
    } finally {
      setIsThinking(false);
    }
  }, [lang, isMuted, onCnrFound, isThinking, startPulse, stopPulse]);

  const startListening = useCallback(() => {
    if (isThinking || isSpeaking) return;
    stopAllAudio();
    setIsSpeaking(false);
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition not supported. Please use Chrome or Edge.\nதமிழில் பேச Chrome உலாவியை பயன்படுத்தவும்.');
      return;
    }
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = LANG_CONFIG[lang].bcp47;
    recognitionRef.current = rec;

    rec.onstart = () => { setIsListening(true); setLiveTranscript(''); startPulse(); };
    rec.onresult = (event: any) => {
      const text = Array.from(event.results as any[]).map((r: any) => r[0].transcript).join('');
      setLiveTranscript(text);
      liveTranscriptRef.current = text;
    };
    rec.onend = async () => {
      setIsListening(false);
      stopPulse();
      const captured = liveTranscriptRef.current;
      if (captured.trim()) await sendMessage(captured.trim());
      setLiveTranscript('');
      liveTranscriptRef.current = '';
    };
    rec.onerror = () => { setIsListening(false); stopPulse(); };

    try { rec.start(); } catch {}
  }, [lang, isThinking, isSpeaking, sendMessage, startPulse, stopPulse]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    stopPulse();
  }, [stopPulse]);

  const handleReset = () => {
    stopAllAudio();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    setMessages([]); setHasInit(false); historyRef.current = [];
    setLiveTranscript(''); liveTranscriptRef.current = '';
    setTextInput(''); setIsListening(false); setIsSpeaking(false); setIsThinking(false);
    stopPulse();
  };

  if (!isOpen) return null;

  const cfg = LANG_CONFIG[lang];

  const waveH = (idx: number) => {
    if (!isListening && !isSpeaking) return '3px';
    const phase = [0.3, 0.8, 1, 0.6, 0.9, 0.4, 0.7, 0.5, 0.85, 0.35, 0.75, 0.55, 0.95, 0.45, 0.65, 0.8][idx % 16];
    return `${4 + pulseLevel * phase * 0.3}px`;
  };

  const QUICK: Record<AssistLang, string[]> = {
    ta: ['எனது வழக்கு எப்போது?', 'ராமேஷ்வர் தயால் வழக்கு', 'எந்த அறையில் கேட்புரை?'],
    hi: ['मेरा केस कब है?', 'रामेश्वर दयाल का केस', 'अगली सुनवाई कहाँ?'],
    en: ['When is my hearing?', 'Rameshwar Dayal case', 'Which courtroom?']
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(5, 10, 30, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeMsg { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
        @keyframes micPulse { 0%, 100% { box-shadow: 0 0 0 0px rgba(239,68,68,0.4), 0 8px 32px rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 14px rgba(239,68,68,0.1), 0 8px 32px rgba(239,68,68,0.5); } }
        .tamil-chat-scroll::-webkit-scrollbar { display: none; }
        .tamil-chat-scroll { scrollbar-width: none; }
        .quick-chip:hover { background: rgba(139,92,246,0.3) !important; border-color: rgba(139,92,246,0.6) !important; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '540px', height: '92vh',
        background: 'linear-gradient(168deg, #0f0c29 0%, #1a1535 50%, #16213e 100%)',
        borderRadius: '28px 28px 0 0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 -24px 80px rgba(139, 92, 246, 0.35), 0 0 0 1px rgba(139,92,246,0.15)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
          background: 'rgba(139, 92, 246, 0.06)'
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(139,92,246,0.5)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
              Jurislink AI உதவியாளர்
            </div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
              {isSpeaking ? '🔊 பேசுகிறேன்...' : isThinking ? '💭 யோசிக்கிறேன்...' : isListening ? '🎙️ கேட்கிறேன்...' : '● Live Legal Assistant · Tamil · Hindi · English'}
            </div>
          </div>

          {/* Lang switcher */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {(['ta', 'hi', 'en'] as AssistLang[]).map(l => (
              <button key={l} onClick={() => switchLanguage(l)} style={{
                padding: '4px 8px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: 700,
                background: lang === l ? 'rgba(139,92,246,0.45)' : 'rgba(255,255,255,0.06)',
                color: lang === l ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                border: lang === l ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
                cursor: 'pointer', minHeight: '26px', transition: 'all 0.2s'
              }}>{LANG_CONFIG[l].label}</button>
            ))}
          </div>

          {/* Mute & Reset & Close */}
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            <button onClick={() => setIsMuted(m => { if (!m) stopAllAudio(); return !m; })} title={isMuted ? 'Unmute' : 'Mute'} style={{
              width: '32px', height: '32px', borderRadius: '9px', border: 'none',
              background: 'rgba(255,255,255,0.07)',
              color: isMuted ? '#f87171' : 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>{isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
            <button onClick={handleReset} title="Reset" style={{
              width: '32px', height: '32px', borderRadius: '9px', border: 'none',
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}><RotateCcw size={14} /></button>
            <button onClick={() => { stopAllAudio(); onClose(); }} style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'rgba(239,68,68,0.13)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}><X size={15} /></button>
          </div>
        </div>

        {/* ── Chat ── */}
        <div className="tamil-chat-scroll" style={{
          flex: 1, overflowY: 'auto', padding: '14px',
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeMsg 0.3s ease'
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '8px', alignSelf: 'flex-end'
                }}><Sparkles size={13} color="#fff" /></div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 13px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                  : 'rgba(255,255,255,0.07)',
                color: '#fff', fontSize: '0.86rem', lineHeight: 1.55, fontWeight: 500,
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.09)' : 'none',
                boxShadow: msg.role === 'user' ? '0 4px 18px rgba(124,58,237,0.35)' : 'none'
              }}>
                {msg.content}
                {msg.matchedCnr && (
                  <div style={{
                    marginTop: '8px', padding: '5px 9px',
                    background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
                    borderRadius: '7px', fontSize: '0.72rem', color: '#4ade80', fontWeight: 700
                  }}>
                    ✅ வழக்கு கண்டுபிடிக்கப்பட்டது: {msg.matchedCnr}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', animation: 'fadeMsg 0.3s ease' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><Sparkles size={13} color="#fff" /></div>
              <div style={{
                padding: '11px 14px', background: 'rgba(255,255,255,0.07)',
                borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', gap: '5px', alignItems: 'center'
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%', background: '#8b5cf6',
                    animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
                <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                  {cfg.thinkingMsg}
                </span>
              </div>
            </div>
          )}

          {isListening && liveTranscript && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeMsg 0.2s ease' }}>
              <div style={{
                maxWidth: '78%', padding: '9px 13px',
                borderRadius: '18px 18px 4px 18px',
                background: 'rgba(139,92,246,0.18)',
                border: '1px dashed rgba(139,92,246,0.45)',
                color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem', fontStyle: 'italic'
              }}>{liveTranscript}...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Mic + Input ── */}
        <div style={{
          flexShrink: 0, padding: '10px 14px 8px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.22)'
        }}>
          {/* Sound wave bars */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '3px', marginBottom: '10px', height: '28px'
          }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                width: '3px', height: waveH(i), borderRadius: '2px',
                background: isListening
                  ? `hsl(${255 + i * 3}, 75%, ${50 + pulseLevel * 0.12}%)`
                  : 'rgba(255,255,255,0.1)',
                transition: 'height 0.07s ease, background 0.3s',
                minHeight: '3px'
              }} />
            ))}
          </div>

          {/* Mic button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isThinking}
              style={{
                width: '66px', height: '66px', borderRadius: '50%', border: 'none',
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isThinking ? 'not-allowed' : 'pointer',
                opacity: isThinking ? 0.5 : 1,
                transition: 'all 0.3s',
                animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
                boxShadow: isListening ? 'none' : '0 8px 28px rgba(139,92,246,0.45)'
              }}
            >{isListening ? <MicOff size={26} /> : <Mic size={26} />}</button>
          </div>

          <div style={{
            textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, marginBottom: '8px',
            color: isListening ? '#c4b5fd' : isSpeaking ? '#67e8f9' : 'rgba(255,255,255,0.3)',
            transition: 'color 0.3s'
          }}>
            {isListening ? cfg.listenHint : isSpeaking ? cfg.speaking : cfg.tapToSpeak}
          </div>

          {/* Quick chips — only when chat is fresh */}
          {!isListening && messages.length <= 1 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' }}>
              {QUICK[lang].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="quick-chip"
                  style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                    background: 'rgba(139,92,246,0.12)', color: '#c4b5fd',
                    border: '1px solid rgba(139,92,246,0.28)', cursor: 'pointer',
                    minHeight: '26px', transition: 'all 0.2s'
                  }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Text input */}
          <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-end' }}>
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (textInput.trim()) sendMessage(textInput); } }}
              placeholder={cfg.placeholder}
              rows={1}
              style={{
                flex: 1, padding: '9px 13px', borderRadius: '13px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.11)',
                color: '#fff', fontSize: '0.85rem', resize: 'none', outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.4, maxHeight: '72px',
                overflowY: 'auto', scrollbarWidth: 'none'
              }}
            />
            <button
              onClick={() => { if (textInput.trim()) sendMessage(textInput); }}
              disabled={!textInput.trim() || isThinking}
              style={{
                width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0, border: 'none',
                background: textInput.trim() ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'rgba(255,255,255,0.05)',
                color: textInput.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: textInput.trim() && !isThinking ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: textInput.trim() ? '0 4px 14px rgba(139,92,246,0.4)' : 'none'
              }}
            ><Send size={17} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamilVoiceAssistant;
