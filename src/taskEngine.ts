import type { ClassLevel, LanguageMode } from './storage';

export type TaskType = 'multiple-choice' | 'matching-pairs' | 'sorting' | 'sequencing' | 'counting' | 'tracing' | 'listen-select' | 'memory';
export type TaskOption = { id: string; emoji: string; word: string; wordUr?: string };
export type LocalizedText = { en: string; ur: string };
export type TaskContent = { title: LocalizedText; instruction: LocalizedText; hint: LocalizedText; success: LocalizedText; retry: LocalizedText; audioId: { en: string; ur: string } };
export type Task = { id: string; letter?: string; title: string; subject: string; type: TaskType; prompt: string; hint: string; answer: string; answerId: string; options: TaskOption[]; reward: number; coins: number; content: TaskContent };
export type ActivityDefinition = { id: string; icon: string; title: string; category: string; typeLabel: string; description: string; tasks: Task[] };
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

const independentOptions = (id: string, language: 'en' | 'ur', title: string, subject: string, type: TaskType, prompt: string, hint: string, answer: string, answerUr: string, answerEmoji: string, wrong: Array<{ word: string; wordUr: string; emoji: string }>, success: string, successUr: string) => {
  const answerId = `${id}-answer`;
  const options = [{ id: answerId, word: language === 'en' ? answer : '', wordUr: language === 'ur' ? answerUr : undefined, emoji: answerEmoji }, ...wrong.map((option, index) => ({ id: `${id}-wrong-${index}`, word: language === 'en' ? option.word : '', wordUr: language === 'ur' ? option.wordUr : undefined, emoji: option.emoji }))];
  return { id, title, subject, type, prompt, hint, answer: language === 'en' ? answer : '', answerId, options, reward: 3, coins: 12, content: { title: text(language === 'en' ? title : '', language === 'ur' ? title : ''), instruction: text(language === 'en' ? prompt : '', language === 'ur' ? prompt : ''), hint: text(language === 'en' ? hint : '', language === 'ur' ? hint : ''), success: text(language === 'en' ? success : '', language === 'ur' ? successUr : ''), retry: text(language === 'en' ? 'Let’s try again. Listen carefully.' : '', language === 'ur' ? 'دوبارہ کوشش کریں۔ غور سے سنیں۔' : ''), audioId: { en: `task-${id}`, ur: `task-${id}` } } } as Task;
};

const englishIndependent = [
  independentOptions('english-count-stars', 'en', 'Count the Stars', 'Numbers', 'counting', 'How many stars do you see?', 'Count each star carefully.', '4', '۴', '⭐', [{ word: '3', wordUr: '۳', emoji: '⭐' }, { word: '5', wordUr: '۵', emoji: '⭐' }], 'Great counting! There are 4 stars.', 'بہت خوب! چار ستارے ہیں۔'),
  independentOptions('english-color-garden', 'en', 'Color Garden', 'Colors', 'sorting', 'Which color is the red flower?', 'Look for the red flower.', 'Red', 'سرخ', '🌹', [{ word: 'Blue', wordUr: 'نیلا', emoji: '🔵' }, { word: 'Yellow', wordUr: 'پیلا', emoji: '🌼' }], 'Wonderful! Red is the color.', 'بہت خوب! یہ سرخ رنگ ہے۔'),
  independentOptions('english-shape-safari', 'en', 'Shape Safari', 'Shapes', 'matching-pairs', 'Which shape matches the circle?', 'Find the shape with no corners.', 'Circle', 'دائرہ', '⚪', [{ word: 'Triangle', wordUr: 'مثلث', emoji: '🔺' }, { word: 'Square', wordUr: 'مربع', emoji: '🟦' }], 'Great matching! The circle matches.', 'بہت خوب! دائرہ مل گیا۔'),
  independentOptions('english-big-small', 'en', 'Big or Small', 'Thinking', 'multiple-choice', 'Which animal is big?', 'Choose the bigger animal.', 'Elephant', 'ہاتھی', '🐘', [{ word: 'Mouse', wordUr: 'چوہا', emoji: '🐭' }, { word: 'Ant', wordUr: 'چیونٹی', emoji: '🐜' }], 'That is big! Well done.', 'شاباش! یہ بڑا ہے۔'),
];
const urduIndependent = [
  independentOptions('urdu-count-stars', 'ur', 'ستارے گنیں', 'گنتی', 'counting', 'کتنے ستارے نظر آ رہے ہیں؟', 'ہر ستارہ گنیں۔', '۴', '۴', '⭐', [{ word: '۳', wordUr: '۳', emoji: '⭐' }, { word: '۵', wordUr: '۵', emoji: '⭐' }], 'There are 4 stars.', 'بہت خوب! چار ستارے ہیں۔'),
  independentOptions('urdu-color-garden', 'ur', 'رنگوں کا باغ', 'رنگ', 'sorting', 'سرخ پھول کا رنگ منتخب کریں۔', 'سرخ پھول تلاش کریں۔', 'سرخ', 'سرخ', '🌹', [{ word: 'نیلا', wordUr: 'نیلا', emoji: '🔵' }, { word: 'پیلا', wordUr: 'پیلا', emoji: '🌼' }], 'The color is red.', 'بہت خوب! یہ سرخ رنگ ہے۔'),
  independentOptions('urdu-shape-safari', 'ur', 'اشکال کی سیر', 'اشکال', 'matching-pairs', 'دائرے جیسی شکل منتخب کریں۔', 'بغیر کونوں والی شکل تلاش کریں۔', 'دائرہ', 'دائرہ', '⚪', [{ word: 'مثلث', wordUr: 'مثلث', emoji: '🔺' }, { word: 'مربع', wordUr: 'مربع', emoji: '🟦' }], 'The circle matches.', 'بہت خوب! دائرہ مل گیا۔'),
  independentOptions('urdu-big-small', 'ur', 'بڑا یا چھوٹا', 'سوچ اور سمجھ', 'multiple-choice', 'بڑا جانور منتخب کریں۔', 'بڑی چیز تلاش کریں۔', 'ہاتھی', 'ہاتھی', '🐘', [{ word: 'چوہا', wordUr: 'چوہا', emoji: '🐭' }, { word: 'چیونٹی', wordUr: 'چیونٹی', emoji: '🐜' }], 'The elephant is big.', 'شاباش! ہاتھی بڑا ہے۔'),
];

export const englishActivities: ActivityDefinition[] = [
  { id: 'abc-adventure', icon: '🍎', title: 'ABC Adventure', category: 'Letters', typeLabel: 'Multiple Choice', description: 'Learn A, B and C with pictures.', tasks: englishTasks },
  { id: 'count-stars', icon: '⭐', title: 'Count the Stars', category: 'Numbers', typeLabel: 'Counting', description: 'Count the stars and choose the correct number.', tasks: [englishIndependent[0]] },
  { id: 'color-garden', icon: '🌈', title: 'Color Garden', category: 'Colors', typeLabel: 'Sorting', description: 'Discover and match beautiful colors.', tasks: [englishIndependent[1]] },
  { id: 'shape-safari', icon: '🔵', title: 'Shape Safari', category: 'Shapes', typeLabel: 'Matching Pairs', description: 'Find and match the same shapes.', tasks: [englishIndependent[2]] },
  { id: 'big-small', icon: '🐘🐭', title: 'Big or Small', category: 'Thinking', typeLabel: 'Multiple Choice', description: 'Choose which object is big or small.', tasks: [englishIndependent[3]] },
];
export const urduActivities: ActivityDefinition[] = [
  { id: 'urdu-letters-adventure', icon: 'الف', title: 'حروف کی مہم', category: 'حروف', typeLabel: 'درست جواب منتخب کریں', description: 'تصاویر کے ساتھ اردو حروف سیکھیں۔', tasks: urduTasks },
  { id: 'urdu-count-stars', icon: '⭐', title: 'ستارے گنیں', category: 'گنتی', typeLabel: 'چیزیں گنیں', description: 'ستارے گنیں اور درست عدد منتخب کریں۔', tasks: [urduIndependent[0]] },
  { id: 'urdu-color-garden', icon: '🌈', title: 'رنگوں کا باغ', category: 'رنگ', typeLabel: 'ترتیب دیں', description: 'خوبصورت رنگ پہچانیں اور ملائیں۔', tasks: [urduIndependent[1]] },
  { id: 'urdu-shape-safari', icon: '🔵', title: 'اشکال کی سیر', category: 'اشکال', typeLabel: 'ایک جیسی اشکال ملائیں', description: 'ایک جیسی اشکال تلاش کرکے ملائیں۔', tasks: [urduIndependent[2]] },
  { id: 'urdu-big-small', icon: '🐘🐭', title: 'بڑا یا چھوٹا', category: 'سوچ اور سمجھ', typeLabel: 'درست جواب منتخب کریں', description: 'بڑی اور چھوٹی چیز کی پہچان کریں۔', tasks: [urduIndependent[3]] },
];

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

export const activitiesFor = (_level: ClassLevel, language: LanguageMode = 'en'): ActivityDefinition[] => language === 'ur' ? urduActivities : englishActivities;
export const tasksFor = (_level: ClassLevel, language: LanguageMode = 'en'): Task[] => activitiesFor(_level, language).flatMap((activity) => activity.tasks);
export const allTasks = [...englishTasks, ...urduTasks];
export const taskText = (task: Task, language: LanguageMode, field: keyof Omit<TaskContent, 'audioId'>): string => language === 'ur' ? task.content[field].ur : task.content[field].en;
