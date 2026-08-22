import { useContext, useMemo, useRef, useState, createContext, type ReactNode } from 'react';
import type { LanguageMode, VoicePreferences } from './storage';
import type { LocalizedText } from './taskEngine';
import { recordedAudio } from './audioMap';
import { VoiceService, type VoiceDiagnostic, type ServiceOptions } from './voiceService';
import { uiText } from './translations';

export type VoiceApi = { enabled: boolean; speaking: boolean; paused: boolean; supported: boolean; voicesReady: boolean; urduVoiceAvailable: boolean; voiceName: string; urduVoiceName: string; diagnostic: VoiceDiagnostic; setEnabled: (value: boolean) => void; unlock: () => void; warmUp: () => void; speak: (text: string, language: LanguageMode, options?: ServiceOptions) => void; speakLocalized: (text: LocalizedText, language: LanguageMode, options?: ServiceOptions) => void; pause: () => void; resume: () => void; stop: () => void };
const VoiceContext = createContext<VoiceApi | null>(null);
const urduSample = 'السلام علیکم!';

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true); const [state, setState] = useState({ speaking: false, paused: false }); const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]); const serviceRef = useRef<VoiceService | null>(null);
  if (!serviceRef.current) serviceRef.current = new VoiceService(setState, setVoices, recordedAudio);
  const service = serviceRef.current; const diagnostic = service.diagnostic();
  const value = useMemo<VoiceApi>(() => ({ enabled, speaking: state.speaking, paused: state.paused, supported: diagnostic.supported, voicesReady: diagnostic.voicesReady, urduVoiceAvailable: diagnostic.urduAvailable || diagnostic.recordedUrduAvailable, voiceName: diagnostic.englishVoice, urduVoiceName: diagnostic.urduVoice, diagnostic, setEnabled: (next) => { setEnabled(next); if (!next) service.stop(); }, unlock: () => service.unlock(), warmUp: () => service.unlock(), speak: (text, language, options) => { if (enabled) void service.speak(text, language, options); }, speakLocalized: (text, language, options) => { if (enabled) void service.speak(language === 'ur' ? text.ur : text.en, language === 'ur' ? 'ur' : 'en', options); }, pause: service.pause.bind(service), resume: service.resume.bind(service), stop: service.stop.bind(service) }), [diagnostic, enabled, service, state.paused, state.speaking, voices.length]);
  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
export function useVoice() { const value = useContext(VoiceContext); if (!value) throw new Error('useVoice must be used inside VoiceProvider'); return value; }
export const languageLabels: Record<'en' | 'ur', { title: string; subtitle: string; sample: LocalizedText }> = { en: { title: 'English', subtitle: 'Hello!', sample: { en: 'Hello!', ur: urduSample } }, ur: { title: 'اردو', subtitle: urduSample, sample: { en: 'Hello!', ur: urduSample } } };

export function VoiceControls({ language, preferences, onPreferencesChange, compact = false }: { language: LanguageMode; preferences: VoicePreferences; onPreferencesChange?: (next: VoicePreferences) => void; compact?: boolean }) {
  const voice = useVoice(); const [localEnabled, setLocalEnabled] = useState(preferences.enabled); const change = (next: Partial<VoicePreferences>) => onPreferencesChange?.({ ...preferences, ...next });
  const speakAgain = () => { voice.unlock(); voice.speak(language === 'ur' ? 'براہ کرم موجودہ سرگرمی کی ہدایت سنیں۔' : 'Listen to the current activity instruction again.', language, { key: `listen-${Date.now()}`, speed: preferences.speed, volume: preferences.volume }); };
  return <div className={compact ? 'voice-controls compact' : 'voice-controls'}>
    <button className="voice-primary" aria-label={uiText(language, 'listenAgain')} onClick={speakAgain}><span className={voice.speaking ? 'speaker-pulse' : ''}>🔊</span><span>{uiText(language, 'listenAgain')}</span></button>
    <button className="voice-icon-btn" aria-label={voice.paused ? uiText(language, 'resume') : uiText(language, 'pause')} onClick={() => voice.paused ? voice.resume() : voice.pause()}>{voice.paused ? '▶' : '⏸'}</button>
    <button className="voice-icon-btn" aria-label={uiText(language, 'stop')} onClick={voice.stop}>■</button>
    <button className="voice-icon-btn" aria-label={localEnabled ? uiText(language, 'voiceOff') : uiText(language, 'voiceOn')} onClick={() => { const next = !localEnabled; setLocalEnabled(next); change({ enabled: next }); voice.setEnabled(next); }}>{localEnabled ? '🔊' : '🔇'}</button>
    <button className="voice-speed-btn" aria-label={preferences.speed === 'slow' ? uiText(language, 'normal') : uiText(language, 'slow')} onClick={() => change({ speed: preferences.speed === 'slow' ? 'normal' : 'slow' })}>{preferences.speed === 'slow' ? uiText(language, 'normal') : uiText(language, 'slow')}</button>
    {!compact && !voice.supported && <small className="voice-note">Voice is unavailable. Pictures and captions still work.</small>}
  </div>;
}
