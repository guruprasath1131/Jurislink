import { SupportedLanguage } from '../types';

/**
 * Jurislink Regional Voice & Text-to-Speech Service
 * Supports 8 Indian languages using the Web Speech API and synthesis hooks.
 * Includes audio cue generation for IVR beeps and call dial tones.
 */

const LANG_BCP47_MAP: Record<SupportedLanguage, string[]> = {
  hi: ['hi-IN', 'hi', 'hin-IND'],
  ta: ['ta-IN', 'ta-LK', 'ta', 'tam-IND'],
  te: ['te-IN', 'te', 'tel-IND'],
  kn: ['kn-IN', 'kn', 'kan-IND'],
  mr: ['mr-IN', 'mr', 'mar-IND'],
  bn: ['bn-IN', 'bn-BD', 'bn', 'ben-IND'],
  gu: ['gu-IN', 'gu', 'guj-IND'],
  en: ['en-IN', 'en-GB', 'en-US', 'en']
};

export class TtsService {
  private static isSpeaking = false;
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static onStateChangeListeners: ((speaking: boolean) => void)[] = [];

  static subscribe(listener: (speaking: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private static notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.onStateChangeListeners.forEach(l => l(speaking));
  }

  static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Speak text in chosen regional language with fallback voice matching
   */
  static speak(text: string, lang: SupportedLanguage = 'en', rate: number = 0.95): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.activeUtterance = utterance;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Find matching regional voice
      const candidateCodes = LANG_BCP47_MAP[lang] || ['en-IN', 'en'];
      const voices = window.speechSynthesis.getVoices();
      
      let matchedVoice = voices.find(v => candidateCodes.some(c => v.lang.toLowerCase().replace('_', '-') === c.toLowerCase()));
      
      if (!matchedVoice) {
        matchedVoice = voices.find(v => candidateCodes.some(c => v.lang.toLowerCase().startsWith(c.split('-')[0])));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = candidateCodes[0];
      }

      utterance.onstart = () => {
        this.notify(true);
      };

      utterance.onend = () => {
        this.notify(false);
        this.activeUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        this.notify(false);
        this.activeUtterance = null;
        resolve();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('TTS error:', err);
        this.notify(false);
        resolve();
      }
    });
  }

  static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.notify(false);
    this.activeUtterance = null;
  }

  /**
   * Play realistic DTMF telephone key tones for the IVR feature-phone simulator
   */
  static playDtmfTone(key: string) {
    if (typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      // Standard Dual-Tone Multi-Frequency (DTMF) frequencies
      const dtmfFreqs: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
      };

      const [f1, f2] = dtmfFreqs[key] || [800, 1200];
      osc1.frequency.value = f1;
      osc2.frequency.value = f2;

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Play phone ringing tone for IVR connect
   */
  static playRingTone(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !(window.AudioContext || (window as any).webkitAudioContext)) {
        setTimeout(resolve, 1500);
        return;
      }
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(425, ctx.currentTime); // Standard Indian dial tone 425Hz

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.2);
        setTimeout(resolve, 1300);
      } catch {
        setTimeout(resolve, 1000);
      }
    });
  }
}
