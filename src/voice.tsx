import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { LanguageMode, VoicePreferences, VoiceSpeed } from './storage';
import type { LocalizedText } from './taskEngine';
import { uiText } from './translations';
import { repairMojibake } from './text';

export type VoiceApi = {
  enabled: boolean; speaking: boolean; paused: boolean; supported: boolean; voicesReady: boolean; urduVoiceAvailable: boolean; voiceName: string;
  setEnabled: (value: boolean) => void; warmUp: () => void;
  speak: (text: string, language: LanguageMode, options?: VoiceOptions) => void;
  speakLocalized: (text: LocalizedText, language: LanguageMode, options?: VoiceOptions) => void;
  pause: () => void; resume: () => void; stop: () => void;
};
type VoiceOptions = { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number };
const VoiceContext = createContext<VoiceApi | null>(null);
const supportedLanguage = (language: LanguageMode): 'en' | 'ur' => language === 'ur' ? 'ur' : 'en';
const codeFor = (language: 'en' | 'ur') => language === 'ur' ? 'ur-PK' : 'en-US';

function chooseVoice(voices: SpeechSynthesisVoice[], language: 'en' | 'ur') {
  if (language === 'ur') {
    return voices.find((voice) => /^ur-(pk|in)$/i.test(voice.lang)) || voices.find((voice) => /^ur/i.test(voice.lang)) || voices.find((voice) => /urdu|multilingual/i.test(voice.name));
  }
  const english = voices.filter((voice) => /^en(-|$)/i.test(voice.lang));
  return english.slice().sort((a, b) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const name = voice.name.toLowerCase();
      return (/(google|natural)/.test(name) ? 100 : 0) + (/(microsoft|neural)/.test(name) ? 80 : 0) + (/(female|samantha|zira|aria|jenny)/.test(name) ? 40 : 0) + (/en-(gb|us)/i.test(voice.lang) ? 20 : 0) + (voice.default ? 5 : 0);
    };
    return score(b) - score(a);
  })[0];
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const lastKey = useRef('');
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const load = () => { const next = window.speechSynthesis.getVoices(); setVoices(next); setVoicesReady(next.length > 0); };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  const stop = useCallback(() => { if (supported) window.speechSynthesis.cancel(); lastKey.current = ''; setSpeaking(false); setPaused(false); }, [supported]);
  const warmUp = useCallback(() => { if (!supported) return; window.speechSynthesis.getVoices(); const warm = new SpeechSynthesisUtterance(' '); warm.volume = 0; warm.rate = 1; window.speechSynthesis.speak(warm); window.speechSynthesis.cancel(); }, [supported]);
  const speak = useCallback((rawText: string, requestedLanguage: LanguageMode, options: VoiceOptions = {}) => {
    const text = repairMojibake(rawText).trim();
    const language = supportedLanguage(requestedLanguage);
    if (!enabled || !supported || !text) return;
    if (options.key && lastKey.current === options.key) return;
    if (options.key) lastKey.current = options.key;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = codeFor(language);
    utterance.rate = options.speed === 'slow' ? 0.82 : 0.88;
    utterance.pitch = 1.04;
    utterance.volume = Math.max(0, Math.min(1, options.volume ?? 1));
    if (options.name && options.phoneticName) utterance.text = utterance.text.split(options.name).join(options.phoneticName);
    const selected = chooseVoice(voices, language);
    if (selected) utterance.voice = selected;
    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(utterance);
  }, [enabled, supported, voices]);
  const speakLocalized = useCallback((text: LocalizedText, language: LanguageMode, options?: VoiceOptions) => {
    // Legacy bilingual profiles are treated as English so no utterance ever mixes languages.
    speak(language === 'ur' ? text.ur : text.en, language === 'ur' ? 'ur' : 'en', options);
  }, [speak]);
  const selectedEnglish = chooseVoice(voices, 'en');
  const urduVoice = chooseVoice(voices, 'ur');
  const value = useMemo<VoiceApi>(() => ({ enabled, speaking, paused, supported, voicesReady, urduVoiceAvailable: Boolean(urduVoice), voiceName: selectedEnglish?.name || 'Browser default', setEnabled: (value) => { setEnabled(value); if (!value) stop(); }, warmUp, speak, speakLocalized, pause: () => { if (supported && window.speechSynthesis.speaking) { window.speechSynthesis.pause(); setPaused(true); } }, resume: () => { if (supported && window.speechSynthesis.paused) { window.speechSynthesis.resume(); setPaused(false); } }, stop }), [enabled, paused, selectedEnglish?.name, speak, speakLocalized, speaking, stop, supported, urduVoice, voicesReady, warmUp]);
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice() { const value = useContext(VoiceContext); if (!value) throw new Error('useVoice must be used inside VoiceProvider'); return value; }

export const languageLabels: Record<'en' | 'ur', { title: string; subtitle: string; sample: LocalizedText }> = {
  en: { title: 'English', subtitle: 'Hello!', sample: { en: 'Hello!', ur: 'السلام علیکم!' } },
  ur: { title: 'اردو', subtitle: 'السلام علیکم!', sample: { en: 'Hello!', ur: 'السلام علیکم!' } },
};

export function VoiceControls({ language, preferences, onPreferencesChange, compact = false }: { language: LanguageMode; preferences: VoicePreferences; onPreferencesChange?: (next: VoicePreferences) => void; compact?: boolean }) {
  const voice = useVoice();
  const change = (next: Partial<VoicePreferences>) => onPreferencesChange?.({ ...preferences, ...next });
  const speakAgain = () => { voice.warmUp(); voice.speak(language === 'ur' ? 'آواز دوبارہ سنیں۔' : 'Listen again.', language, { key: `listen-${Date.now()}`, speed: preferences.speed, volume: preferences.volume }); };
  return <div className={compact ? 'voice-controls compact' : 'voice-controls'}>
    <button className="voice-primary" aria-label={uiText(language, 'listenAgain')} title={uiText(language, 'listenAgain')} onClick={speakAgain}><span className={voice.speaking ? 'speaker-pulse' : ''}>🔊</span><span>{uiText(language, 'listenAgain')}</span></button>
    <button className="voice-icon-btn" aria-label={voice.paused ? uiText(language, 'resume') : uiText(language, 'pause')} title={voice.paused ? uiText(language, 'resume') : uiText(language, 'pause')} onClick={() => voice.paused ? voice.resume() : voice.pause()}>{voice.paused ? '▶' : '⏸'}</button>
    <button className="voice-icon-btn" aria-label={uiText(language, 'stop')} title={uiText(language, 'stop')} onClick={voice.stop}>■</button>
    <button className="voice-icon-btn" aria-label={preferences.enabled ? uiText(language, 'voiceOff') : uiText(language, 'voiceOn')} title={preferences.enabled ? uiText(language, 'voiceOff') : uiText(language, 'voiceOn')} onClick={() => { const next = !preferences.enabled; change({ enabled: next }); voice.setEnabled(next); }}>{preferences.enabled ? '🔊' : '🔇'}</button>
    <button className="voice-speed-btn" aria-label={preferences.speed === 'slow' ? uiText(language, 'normal') : uiText(language, 'slow')} title={preferences.speed === 'slow' ? uiText(language, 'normal') : uiText(language, 'slow')} onClick={() => change({ speed: preferences.speed === 'slow' ? 'normal' : 'slow' })}>{preferences.speed === 'slow' ? uiText(language, 'slow') : uiText(language, 'normal')}</button>
    {!compact && !voice.supported && <small className="voice-note">Voice is unavailable. Pictures and captions still work.</small>}
  </div>;
}
