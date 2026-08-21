import type { LanguageMode } from './storage';
import { repairMojibake } from './text';

export type UiKey = 'parentZone' | 'privacy' | 'listenAgain' | 'pause' | 'resume' | 'stop' | 'voiceOn' | 'voiceOff' | 'slow' | 'normal' | 'exit' | 'next' | 'finish' | 'tryAgain' | 'excellent' | 'hint' | 'tapPicture' | 'back' | 'startAdventure' | 'welcomeBack' | 'chooseLevel' | 'todayAdventure';

const en: Record<UiKey, string> = {
  parentZone: 'Parent zone', privacy: 'Privacy', listenAgain: 'Listen again', pause: 'Pause', resume: 'Resume', stop: 'Stop', voiceOn: 'Voice on', voiceOff: 'Voice off', slow: 'Slow', normal: 'Normal', exit: 'Exit', next: 'Next', finish: 'Finish', tryAgain: 'Let’s try again. Listen carefully.', excellent: 'Excellent!', hint: 'Hint', tapPicture: 'Find the correct picture.', back: 'Back', startAdventure: 'Start adventure', welcomeBack: 'Welcome back', chooseLevel: 'Choose your learning level', todayAdventure: 'Today’s adventure',
};

const ur: Record<UiKey, string> = {
  parentZone: 'والدین کا حصہ', privacy: 'رازداری', listenAgain: 'دوبارہ سنیں', pause: 'روکیں', resume: 'جاری رکھیں', stop: 'بند کریں', voiceOn: 'آواز آن', voiceOff: 'آواز آف', slow: 'آہستہ', normal: 'عام', exit: 'باہر جائیں', next: 'اگلا', finish: 'مکمل کریں', tryAgain: 'کوئی بات نہیں، دوبارہ کوشش کریں۔', excellent: 'بہت خوب!', hint: 'اشارہ', tapPicture: 'صحیح تصویر منتخب کریں۔', back: 'واپس', startAdventure: 'مہم شروع کریں', welcomeBack: 'خوش آمدید', chooseLevel: 'اپنا تعلیمی درجہ منتخب کریں', todayAdventure: 'آج کی مہم',
};

export function uiText(language: LanguageMode, key: UiKey): string {
  return language === 'ur' ? repairMojibake(ur[key]) : en[key];
}
