import type { ClassLevel, LanguageMode } from './storage';

export type TaskType = 'multiple-choice' | 'matching-pairs' | 'sorting' | 'sequencing' | 'counting' | 'tracing' | 'listen-select' | 'memory';
export type TaskOption = { id: string; emoji: string; word: string; wordUr?: string };
export type LocalizedText = { en: string; ur: string };
export type TaskContent = { title: LocalizedText; instruction: LocalizedText; hint: LocalizedText; success: LocalizedText; retry: LocalizedText; audioId: { en: string; ur: string } };
export type Task = { id: string; letter?: string; title: string; subject: string; type: TaskType; prompt: string; hint: string; answer: string; answerId: string; options: TaskOption[]; reward: number; coins: number; content: TaskContent };
export type AlphabetActivity = { id: string; target: string; targetName: string; answer: string; emoji: string; wrong: { word: string; emoji: string }[]; title: LocalizedText; instruction: LocalizedText; hint: LocalizedText; success: LocalizedText; retry: LocalizedText };

const text = (en: string, ur: string): LocalizedText => ({ en, ur });
const alphabet = (item: AlphabetActivity, language: 'en' | 'ur', activityTitle?: string): Task => {
  const urdu = language === 'ur';
  const answerId = `${item.id}-answer`;
  const options = [{ id: answerId, emoji: item.emoji, word: item.answer, wordUr: item.answer }, ...item.wrong.map((option, index) => ({ id: `${item.id}-wrong-${index}`, ...option, wordUr: option.word }))];
  return { id: item.id, letter: item.target, title: activityTitle || (urdu ? item.title.ur : item.title.en), subject: urdu ? 'حروف' : 'Letters', type: 'multiple-choice', prompt: urdu ? item.instruction.ur : item.instruction.en, hint: urdu ? item.hint.ur : item.hint.en, answer: item.answer, answerId, options, reward: 3, coins: 12, content: { title: item.title, instruction: item.instruction, hint: item.hint, success: item.success, retry: item.retry, audioId: { en: `task-${item.id}`, ur: `task-${item.id}` } } };
};

const urduEntries: Array<[string, string, string, string]> = [
  ['ا', 'الف', 'انار', '🍎'], ['ب', 'ب', 'بکری', '🐐'], ['پ', 'پ', 'پتنگ', '🪁'], ['ت', 'ت', 'تتلی', '🦋'], ['ٹ', 'ٹ', 'ٹماٹر', '🍅'], ['ج', 'ج', 'جہاز', '✈️'], ['چ', 'چ', 'چاند', '🌙'], ['د', 'د', 'درخت', '🌳'], ['س', 'س', 'سیب', '🍎'], ['ش', 'ش', 'شیر', '🦁'], ['ک', 'ک', 'کتاب', '📖'], ['گ', 'گ', 'گلاب', '🌹'], ['م', 'م', 'مچھلی', '🐟'], ['ن', 'ن', 'ناشپاتی', '🍐'], ['ہ', 'ہ', 'ہاتھی', '🐘'],
];
export const urduAlphabetActivities: AlphabetActivity[] = urduEntries.map(([target, targetName, answer, emoji], index) => {
  const wrongEntries = urduEntries.filter(([letter]) => letter !== target);
  const preferred = index < 3 ? (index === 0 ? ['بکری', 'پتنگ'] : index === 1 ? ['انار', 'پتنگ'] : ['انار', 'بکری']) : wrongEntries.slice(index % 5, index % 5 + 2).map((entry) => entry[2]);
  const wrong = preferred.map((word) => { const entry = urduEntries.find((candidate) => candidate[2] === word)!; return { word, emoji: entry[3] }; });
  return { id: `urdu-${index}-${target}`, target, targetName, answer, emoji, wrong, title: text('', `${targetName} سے ${answer}`), instruction: text('', `وہ تصویر منتخب کریں جو ${targetName} سے شروع ہوتی ہے۔ ${targetName} سے ${answer}۔`), hint: text('', `${answer} کی تصویر تلاش کریں۔`), success: text('', index === 1 ? `بہت خوب! ${targetName} سے ${answer}۔` : `شاباش! ${targetName} سے ${answer}۔`), retry: text('', 'یہ درست جواب نہیں ہے۔ دوبارہ کوشش کریں۔') };
});

// Keep the exact spoken Urdu curriculum strings explicit and auditable.
urduAlphabetActivities[0].instruction.ur = 'وہ تصویر منتخب کریں جو الف سے شروع ہوتی ہے۔ الف سے انار۔';
urduAlphabetActivities[1].instruction.ur = 'وہ تصویر منتخب کریں جو ب سے شروع ہوتی ہے۔ ب سے بکری۔';
urduAlphabetActivities[2].instruction.ur = 'وہ تصویر منتخب کریں جو پ سے شروع ہوتی ہے۔ پ سے پتنگ۔';

const englishEntries: Array<[string, string, string, string, string[]]> = [
  ['A', 'A', 'Apple', '🍎', ['Bee', 'Cat']], ['B', 'B', 'Bee', '🐝', ['Apple', 'Cat']], ['C', 'C', 'Cat', '🐱', ['Apple', 'Bee']], ['D', 'D', 'Dog', '🐶', ['Apple', 'Bee']], ['E', 'E', 'Egg', '🥚', ['Apple', 'Cat']],
];
export const englishAlphabetActivities: AlphabetActivity[] = englishEntries.map(([target, targetName, answer, emoji, wrongWords], index) => ({ id: `english-${target.toLowerCase()}`, target, targetName, answer, emoji, wrong: wrongWords.map((word) => ({ word, emoji: word === 'Apple' ? '🍎' : word === 'Bee' ? '🐝' : word === 'Cat' ? '🐱' : '🐶' })), title: text(['ABC Adventure', 'ABC Adventure', 'ABC Adventure', 'Letter Adventure', 'Letter Adventure'][index], ''), instruction: text(`Find the picture that starts with ${target}.`, ''), hint: text(`Listen for the ${target} sound.`, ''), success: text(index === 0 ? 'Amazing! A is for Apple.' : index === 1 ? 'Brilliant! B is for Bee.' : index === 2 ? 'Correct! C is for Cat.' : `Great! ${target} is for ${answer}.`, ''), retry: text('Let’s try again. Listen carefully.', '') }));

export const urduActivityLabels = ['حروف کی مہم', 'تصویر منتخب کریں', 'حرف اور تصویر ملائیں', 'نقطے ملا کر حرف بنائیں', 'آواز سن کر حرف منتخب کریں', 'ایک جیسے حروف ملائیں', 'لفظ کا پہلا حرف پہچانیں'] as const;
export const englishActivityLabels = ['ABC Adventure', 'Count the Stars', 'Color Garden', 'Shape Safari', 'Big or Small'] as const;
export const urduAdventureLabels = ['حروف کی مہم', 'ستارے گنیں', 'رنگوں کا باغ', 'اشکال کی سیر', 'بڑا یا چھوٹا'] as const;

export const englishTasks = englishAlphabetActivities.map((item, index) => alphabet(item, 'en', englishActivityLabels[index]));
export const urduTasks = urduAlphabetActivities.map((item) => alphabet(item, 'ur', item === urduAlphabetActivities[0] ? 'حروف کی مہم' : undefined));

export function validateAlphabetActivities(items: AlphabetActivity[], language: 'en' | 'ur'): string[] {
  const errors: string[] = [];
  for (const item of items) {
    const options = [item.answer, ...item.wrong.map((option) => option.word)];
    if (new Set(options).size !== options.length) errors.push(`${item.id}: duplicate option`);
    if (!item.answer.startsWith(item.target)) errors.push(`${item.id}: answer does not start with ${item.target}`);
    if (item.wrong.some((option) => option.word.startsWith(item.target))) errors.push(`${item.id}: wrong option starts with ${item.target}`);
    if (language === 'ur' && /[A-Za-z]/.test(item.target + item.answer)) errors.push(`${item.id}: English content in Urdu dataset`);
  }
  return errors;
}
export const urduAlphabetValidationErrors = validateAlphabetActivities(urduAlphabetActivities, 'ur');
if (urduAlphabetValidationErrors.length) throw new Error(urduAlphabetValidationErrors.join('; '));
if ('سیب'.startsWith('ا') || !'انار'.startsWith('ا') || !'سیب'.startsWith('س')) throw new Error('Urdu alphabet regression validation failed');

export const tasksFor = (_level: ClassLevel, language: LanguageMode = 'en'): Task[] => language === 'ur' ? urduTasks : englishTasks;
export const allTasks = [...englishTasks, ...urduTasks];
export const taskText = (task: Task, language: LanguageMode, field: keyof Omit<TaskContent, 'audioId'>): string => language === 'ur' ? task.content[field].ur : task.content[field].en;
