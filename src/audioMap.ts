export type VoiceLanguage = 'en' | 'ur';
export type RecordedAudioId = 'welcome' | 'listen-carefully' | 'tap-correct-answer' | 'try-again' | 'excellent' | 'congratulations' | 'next-task' | 'task-complete';
export type RecordedAudioMap = Partial<Record<VoiceLanguage, Partial<Record<RecordedAudioId, string>>>>;

// Keep this map typed and local. Empty entries deliberately use native speech fallback.
// Human-recorded Urdu files can be added under /public/audio/ur/ without changing the VoiceService.
export const recordedAudio: RecordedAudioMap = { en: {}, ur: {} };
