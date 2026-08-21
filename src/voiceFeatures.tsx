import { Check, Mic2, RotateCcw, Volume2 } from 'lucide-react';
import type { LanguageMode, Profile, VoicePreferences } from './storage';
import { languageLabels, useVoice } from './voice';
import { repairMojibake } from './text';

export function ParentVoiceSettings({ profile, onUpdate }: { profile: Profile; onUpdate: (next: Partial<Profile>) => void }) {
  const voice = useVoice();
  const updateVoice = (next: Partial<VoicePreferences>) => onUpdate({ voice: { ...profile.voice, ...next } });
  const test = () => voice.speakLocalized({ en: `Hello ${profile.name}! Voice guidance is ready.`, ur: `السلام علیکم ${profile.name}! آواز کی رہنمائی تیار ہے۔` }, profile.language, { key: `test-${Date.now()}`, name: profile.name, phoneticName: profile.phoneticName, speed: profile.voice.speed, volume: profile.voice.volume });
  return <article className="panel voice-settings-panel" dir={profile.language === 'ur' ? 'rtl' : 'ltr'}>
    <div className="panel-heading"><div><p className="eyebrow">For grown-ups</p><h3>Voice & language</h3></div><span><Mic2 size={15} /> Child-friendly audio</span></div>
    <p className="panel-note">Voice guidance helps children play even if they cannot read yet.</p>
    <div className="language-grid">{(Object.keys(languageLabels) as LanguageMode[]).map((option) => <button key={option} className={profile.language === option ? 'language-card selected' : 'language-card'} onClick={() => { onUpdate({ language: option }); voice.speakLocalized(languageLabels[option].sample, option, { key: `language-sample-${option}-${Date.now()}`, speed: profile.voice.speed, volume: profile.voice.volume }); }}><span className="language-speaker">{profile.language === option ? <Check size={18} /> : <Volume2 size={18} />}</span><strong>{repairMojibake(languageLabels[option].title)}</strong><small>{repairMojibake(languageLabels[option].subtitle)}</small></button>)}</div>
    <div className="voice-setting-row"><label><input type="checkbox" checked={profile.voice.enabled} onChange={(event) => { updateVoice({ enabled: event.target.checked }); voice.setEnabled(event.target.checked); }} /> Voice on</label><label><input type="checkbox" checked={profile.voice.autoInstructions} onChange={(event) => updateVoice({ autoInstructions: event.target.checked })} /> Automatic instructions</label></div>
    <div className="voice-setting-row"><label>Voice speed<select value={profile.voice.speed} onChange={(event) => updateVoice({ speed: event.target.value as VoicePreferences['speed'] })}><option value="slow">Slow</option><option value="normal">Normal</option></select></label><label>Volume<input type="range" min="0" max="1" step="0.05" value={profile.voice.volume} onChange={(event) => updateVoice({ volume: Number(event.target.value) })} /></label></div>
    <label className="phonetic-field">Name pronunciation <input value={profile.phoneticName || ''} onChange={(event) => onUpdate({ phoneticName: event.target.value || undefined })} placeholder="Optional: how the name sounds" /></label>
    <div className="voice-actions"><button className="secondary-btn" onClick={test}><Volume2 size={17} /> Test Voice</button><button className="text-btn" onClick={() => { updateVoice({ ...profile.voice, ...{ enabled: true, autoInstructions: true, speed: 'normal', volume: 0.85 } }); voice.setEnabled(true); }}><RotateCcw size={16} /> Reset audio preferences</button></div>
    <small className="voice-note">No microphone is used. Urdu recordings can be added later; this version uses installed browser voices when available.</small>
  </article>;
}
