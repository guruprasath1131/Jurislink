import React, { createContext, useContext, useState, useEffect } from 'react';
import { TtsService } from '../services/ttsService';
import { useLanguage } from './LanguageContext';

interface VoiceContextType {
  isSpeaking: boolean;
  speak: (text: string) => Promise<void>;
  stop: () => void;
  playTone: (key: string) => void;
  isAutoPlayEnabled: boolean;
  toggleAutoPlay: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);

  useEffect(() => {
    const unsub = TtsService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  const speak = async (text: string) => {
    await TtsService.speak(text, language);
  };

  const stop = () => {
    TtsService.stop();
  };

  const playTone = (key: string) => {
    TtsService.playDtmfTone(key);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlayEnabled(prev => !prev);
  };

  return (
    <VoiceContext.Provider value={{
      isSpeaking,
      speak,
      stop,
      playTone,
      isAutoPlayEnabled,
      toggleAutoPlay
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
