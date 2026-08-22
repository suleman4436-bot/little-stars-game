import type { LanguageMode, VoiceSpeed } from './storage';
import type { RecordedAudioId, RecordedAudioMap } from './audioMap';

export type VoiceDiagnostic = { supported: boolean; voicesReady: boolean; englishVoice: string; englishLang: string; urduVoice: string; urduLang: string; urduAvailable: boolean; recordedUrduAvailable: boolean };
export type ServiceOptions = { key?: string; name?: string; phoneticName?: string; speed?: VoiceSpeed; volume?: number; audioId?: RecordedAudioId };
const englishScore = (voice: SpeechSynthesisVoice) => (/(microsoft|google|natural|neural)/i.test(voice.name) ? 100 : 0) + (/en-GB/i.test(voice.lang) ? 25 : /en-US/i.test(voice.lang) ? 20 : 0) + (voice.default ? 3 : 0);

export class VoiceService {
  private readonly synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
  private timer: number | null = null;
  private generation = 0;
  private lastKey = '';
  private unlocked = false;
  private currentAudio: HTMLAudioElement | null = null;
  private readonly refreshVoices = () => { this.voices = this.synth?.getVoices() || []; this.onVoices(this.voices); };

  constructor(private readonly onState: (state: { speaking: boolean; paused: boolean }) => void, private readonly onVoices: (voices: SpeechSynthesisVoice[]) => void, private readonly recorded: RecordedAudioMap) {
    if (this.synth) { this.refreshVoices(); this.synth.addEventListener('voiceschanged', this.refreshVoices); }
  }
  get supported() { return Boolean(this.synth); }
  unlock() { this.unlocked = true; this.refreshVoices(); }
  async waitForVoices() {
    if (!this.synth) return [];
    this.refreshVoices();
    if (this.voices.length) return this.voices;
    if (!this.voicesPromise) this.voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const finish = () => { this.refreshVoices(); resolve(this.voices); };
      this.synth?.addEventListener('voiceschanged', finish, { once: true });
      window.setTimeout(finish, 1500);
    }).then((voices) => { this.voicesPromise = null; return voices; });
    return this.voicesPromise;
  }
  private find(language: 'en' | 'ur') {
    if (language === 'ur') return this.voices.find((v) => /Microsoft Asad Urdu Pakistan/i.test(v.name)) || this.voices.find((v) => /Microsoft Uzma Urdu Pakistan/i.test(v.name)) || this.voices.find((v) => /^ur-PK$/i.test(v.lang)) || this.voices.find((v) => /^ur-IN$/i.test(v.lang)) || this.voices.find((v) => /^ur(?:-|$)/i.test(v.lang));
    return this.voices.filter((v) => /^en(?:-|$)/i.test(v.lang)).sort((a, b) => englishScore(b) - englishScore(a))[0];
  }
  diagnostic(): VoiceDiagnostic { const urdu = this.find('ur'); const english = this.find('en'); return { supported: this.supported, voicesReady: this.voices.length > 0, englishVoice: english?.name || 'Browser default', englishLang: english?.lang || 'en-GB', urduVoice: urdu?.name || 'Unavailable', urduLang: urdu?.lang || 'Unavailable', urduAvailable: Boolean(urdu), recordedUrduAvailable: Boolean(Object.keys(this.recorded.ur || {}).length) }; }
  private clearTimer() { if (this.timer !== null) { window.clearTimeout(this.timer); this.timer = null; } }
  stop() { this.generation += 1; this.clearTimer(); this.synth?.cancel(); this.currentAudio?.pause(); this.currentAudio = null; this.lastKey = ''; this.onState({ speaking: false, paused: false }); }
  pause() { if (this.currentAudio) this.currentAudio.pause(); else if (this.synth?.speaking) this.synth.pause(); this.onState({ speaking: true, paused: true }); }
  resume() { if (this.currentAudio) void this.currentAudio.play(); else if (this.synth?.paused) this.synth.resume(); this.onState({ speaking: true, paused: false }); }
  async speak(raw: string, requested: LanguageMode, options: ServiceOptions = {}) {
    if (!this.unlocked || !raw.trim()) return;
    const language: 'en' | 'ur' = requested === 'ur' ? 'ur' : 'en';
    if (options.key && options.key === this.lastKey) return;
    this.stop();
    this.lastKey = options.key || '';
    const generation = this.generation;
    const text = raw.trim();
    await this.waitForVoices();
    if (generation !== this.generation) return;
    const recordedPath = options.audioId ? this.recorded[language]?.[options.audioId] : undefined;
    if (recordedPath) { const audio = new Audio(recordedPath); this.currentAudio = audio; audio.volume = options.volume ?? 1; audio.onplay = () => this.onState({ speaking: true, paused: false }); audio.onended = () => this.onState({ speaking: false, paused: false }); void audio.play().catch(() => this.speakNative(text, language, options, generation)); return; }
    if (language === 'ur' && !this.find('ur')) { this.onState({ speaking: false, paused: false }); return; }
    this.timer = window.setTimeout(() => this.speakNative(text, language, options, generation), 90);
  }
  private speakNative(text: string, language: 'en' | 'ur', options: ServiceOptions, generation: number) {
    if (!this.synth || generation !== this.generation) return;
    const voice = this.find(language);
    if (language === 'ur' && !voice) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ur' ? 'ur-PK' : 'en-GB'; utterance.voice = voice || null;
    utterance.rate = options.speed === 'slow' ? (language === 'ur' ? 0.72 : 0.78) : (language === 'ur' ? 0.80 : 0.86); utterance.pitch = 1; utterance.volume = options.volume ?? 1;
    if (options.name && options.phoneticName) utterance.text = utterance.text.split(options.name).join(options.phoneticName);
    utterance.onstart = () => generation === this.generation && this.onState({ speaking: true, paused: false });
    utterance.onend = () => generation === this.generation && this.onState({ speaking: false, paused: false });
    utterance.onerror = () => generation === this.generation && this.onState({ speaking: false, paused: false });
    this.synth.speak(utterance);
  }
}
