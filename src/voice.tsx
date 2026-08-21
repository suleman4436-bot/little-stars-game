import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { LanguageMode, VoicePreferences, VoiceSpeed } from './storage';
import type { LocalizedText } from './taskEngine';
import { repairMojibake } from './text';

export type VoiceApi = {
  enabled: boolean;
  speaking: boolean;
  paused: boolean;
  supported: boolean;
  voicesReady: boolean;
  setEnabled: (value: boolean) => void;
  speak: (text: string, language: LanguageMode, options?: { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number }) => void;
  speakLocalized: (text: LocalizedText, language: LanguageMode, options?: { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const VoiceContext = createContext<VoiceApi | null>(null);
const languageCode = (language: 'en' | 'ur') => language === 'ur' ? 'ur-PK' : 'en-US';

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const lastKey = useRef('');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const markReady = () => setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    markReady();
    window.speechSynthesis.addEventListener('voiceschanged', markReady);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', markReady);
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported]);

  const speak = useCallback((text: string, language: LanguageMode, options: { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number } = {}) => {
    text = repairMojibake(text);
    if (!enabled || !supported || !text.trim()) return;
    if (options.key && lastKey.current === options.key) return;
    if (options.key) lastKey.current = options.key;
    window.speechSynthesis.cancel();
    const parts = language === 'bilingual' ? text.split('\n---\n').map((part, index) => ({ text: part, lang: index === 0 ? 'en' as const : 'ur' as const })) : [{ text, lang: language }];
    const rate = options.speed === 'slow' ? 0.78 : 0.92;
    parts.forEach((part, index) => {
      const utterance = new SpeechSynthesisUtterance(part.text);
      utterance.lang = languageCode(part.lang);
      utterance.rate = rate;
      utterance.volume = Math.max(0, Math.min(1, options.volume ?? 0.85));
      if (options.name && options.phoneticName && index === 0) utterance.text = utterance.text.split(options.name).join(options.phoneticName);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((voice) => voice.lang.toLowerCase().startsWith(part.lang === 'ur' ? 'ur' : 'en'));
      if (preferred) utterance.voice = preferred;
      if (index === 0) utterance.onstart = () => { setSpeaking(true); setPaused(false); };
      if (index === parts.length - 1) { utterance.onend = () => { setSpeaking(false); setPaused(false); }; utterance.onerror = () => { setSpeaking(false); setPaused(false); }; }
      window.speechSynthesis.speak(utterance);
    });
  }, [enabled, supported]);

  const speakLocalized = useCallback((text: LocalizedText, language: LanguageMode, options?: { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number }) => {
    if (language === 'ur') speak(repairMojibake(text.ur), language, options);
    else if (language === 'en') speak(repairMojibake(text.en), language, options);
    else {
      if (!enabled || !supported) return;
      const joined = `${text.en}\n---\n${text.ur}`;
      speak(joined, language, options);
    }
  }, [enabled, speak, supported]);

  const value = useMemo<VoiceApi>(() => ({ enabled, speaking, paused, supported, voicesReady, setEnabled: (value) => { setEnabled(value); if (!value) stop(); }, speak, speakLocalized, pause: () => { if (supported && window.speechSynthesis.speaking) { window.speechSynthesis.pause(); setPaused(true); } }, resume: () => { if (supported && window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); } }, stop }), [enabled, paused, speak, speakLocalized, speaking, stop, supported, voicesReady]);
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const value = useContext(VoiceContext);
  if (!value) throw new Error('useVoice must be used inside VoiceProvider');
  return value;
}

export function localizeName(name: string, language: LanguageMode) {
  return language === 'ur' ? `السلام علیکم ${name}!` : language === 'bilingual' ? `Hello, ${name}! السلام علیکم ${name}!` : `Hello, ${name}!`;
}

export const languageLabels: Record<LanguageMode, { title: string; subtitle: string; sample: LocalizedText }> = {
  en: { title: 'English', subtitle: 'Hello!', sample: { en: 'Hello!', ur: 'السلام علیکم!' } },
  ur: { title: 'اردو', subtitle: 'اردو', sample: { en: 'Hello!', ur: 'السلام علیکم!' } },
  bilingual: { title: 'English + اردو', subtitle: 'Hello! السلام علیکم!', sample: { en: 'Hello!', ur: 'السلام علیکم!' } },
};

export function VoiceControls({ language, preferences, onPreferencesChange, compact = false }: { language: LanguageMode; preferences: VoicePreferences; onPreferencesChange?: (next: VoicePreferences) => void; compact?: boolean }) {
  const voice = useVoice();
  const change = (next: Partial<VoicePreferences>) => onPreferencesChange?.({ ...preferences, ...next });
  return <div className={compact ? 'voice-controls compact' : 'voice-controls'}>
    <button className="voice-primary" aria-label="Listen again" onClick={() => voice.speak(language === 'ur' ? 'آواز دوبارہ سنیں۔' : language === 'bilingual' ? 'Listen again. آواز دوبارہ سنیں۔' : 'Listen again.', language, { key: `listen-${Date.now()}`, speed: preferences.speed, volume: preferences.volume })}><span className={voice.speaking ? 'speaker-pulse' : ''}>🔊</span><span>{language === 'ur' ? 'دوبارہ سنیں' : 'Listen again'}</span></button>
    <button className="voice-icon-btn" aria-label={voice.paused ? 'Continue voice' : 'Pause voice'} onClick={() => voice.paused ? voice.resume() : voice.pause()}>{voice.paused ? '▶' : '⏸'}</button>
    <button className="voice-icon-btn" aria-label="Stop voice" onClick={voice.stop}>■</button>
    <button className="voice-icon-btn" aria-label={preferences.enabled ? 'Turn sound off' : 'Turn sound on'} onClick={() => { const next = !preferences.enabled; change({ enabled: next }); voice.setEnabled(next); }}>{preferences.enabled ? '🔊' : '🔇'}</button>
    {!compact && !voice.supported && <small className="voice-note">Voice is unavailable in this browser. Pictures and captions still work.</small>}
  </div>;
}
