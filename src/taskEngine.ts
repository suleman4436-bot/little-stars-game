import type { ClassLevel, LanguageMode } from './storage';
import { repairMojibake } from './text';

export type TaskType = 'multiple-choice' | 'matching-pairs' | 'sorting' | 'sequencing' | 'counting' | 'tracing' | 'listen-select' | 'memory';
export type TaskOption = { emoji: string; word: string; wordUr?: string };
export type LocalizedText = { en: string; ur: string };
export type TaskContent = { title: LocalizedText; instruction: LocalizedText; hint: LocalizedText; success: LocalizedText; retry: LocalizedText; audioId: { en: string; ur: string } };
export type Task = { id: string; title: string; subject: string; type: TaskType; prompt: string; hint: string; answer: string; options: TaskOption[]; reward: number; coins: number; content: TaskContent };

const urdu: Record<string, Partial<TaskContent>> = {
  'match-a': { title: { en: 'ABC Adventure', ur: 'حروف کی مہم' }, instruction: { en: 'Find the picture that starts with A.', ur: 'وہ تصویر دبائیں جو ا سے شروع ہوتی ہے۔' }, hint: { en: 'Listen for the A sound.', ur: 'ا کی آواز سنیں۔' }, success: { en: 'Wonderful! You found the apple.', ur: 'شاباش! آپ نے سیب ڈھونڈ لیا۔' } },
  'count-stars': { title: { en: 'Count the Stars', ur: 'ستارے گنیں' }, instruction: { en: 'How many stars can you see?', ur: 'آپ کو کتنے ستارے نظر آ رہے ہیں؟' }, hint: { en: 'Count each star slowly.', ur: 'ہر ستارہ آہستہ آہستہ گنیں۔' } },
  'color-sort': { title: { en: 'Color Garden', ur: 'رنگوں کا باغ' }, instruction: { en: 'Which one is blue?', ur: 'نیلا رنگ کون سا ہے؟' }, hint: { en: 'Look for the color of the sky.', ur: 'آسمان کا رنگ دیکھیں۔' } },
  'shape-friend': { title: { en: 'Shape Safari', ur: 'شکلوں کی سیر' }, instruction: { en: 'Which picture is a circle?', ur: 'دائرے والی تصویر کون سی ہے؟' }, hint: { en: 'A circle is round.', ur: 'دائرہ گول ہوتا ہے۔' } },
  'big-small': { title: { en: 'Big or Small', ur: 'بڑا یا چھوٹا' }, instruction: { en: 'Which animal is big?', ur: 'کون سا جانور بڑا ہے؟' }, hint: { en: 'Think about the animal that needs more space.', ur: 'اس جانور کے بارے میں سوچیں جسے زیادہ جگہ چاہیے۔' } },
  'upper-lower': { title: { en: 'Letter Friends', ur: 'حروف کے دوست' }, instruction: { en: 'Match uppercase A with its lowercase friend.', ur: 'بڑے ا کو اس کے چھوٹے دوست سے ملائیں۔' }, hint: { en: 'Uppercase A and lowercase a are friends.', ur: 'بڑا ا اور چھوٹا ا دوست ہیں۔' } },
  'missing-letter': { title: { en: 'Missing Letter', ur: 'گم شدہ حرف' }, instruction: { en: 'What letter comes after A?', ur: 'ا کے بعد کون سا حرف آتا ہے؟' }, hint: { en: 'Say A, then the next letter.', ur: 'ا کہیں، پھر اگلا حرف کہیں۔' } },
  'number-quantity': { title: { en: 'Number Meadow', ur: 'نمبروں کا میدان' }, instruction: { en: 'Which group shows six?', ur: 'چھ چیزوں والا گروپ کون سا ہے؟' }, hint: { en: 'Count the dots in each group.', ur: 'ہر گروپ کے نقطے گنیں۔' } },
  'word-picture': { title: { en: 'Word Picnic', ur: 'لفظوں کی پکنک' }, instruction: { en: 'Which picture matches the sun?', ur: 'سورج سے ملتی تصویر کون سی ہے؟' }, hint: { en: 'The sun shines in the sky.', ur: 'سورج آسمان میں چمکتا ہے۔' } },
  'memory-cards': { title: { en: 'Memory Garden', ur: 'یادداشت کا باغ' }, instruction: { en: 'Find the matching pair.', ur: 'ملتا جلتا جوڑا ڈھونڈیں۔' }, hint: { en: 'Look carefully and remember.', ur: 'غور سے دیکھیں اور یاد رکھیں۔' } },
  'word-builder': { title: { en: 'Word Builder', ur: 'لفظ بنائیں' }, instruction: { en: 'Which word starts with c-a-t?', ur: 'کون سا لفظ ک، اے، ٹ سے شروع ہوتا ہے؟' }, hint: { en: 'Blend the sounds c, a, t.', ur: 'ک، اے، ٹ کی آوازیں ملائیں۔' } },
  'beginning-sound': { title: { en: 'Sound Detective', ur: 'آواز کے جاسوس' }, instruction: { en: 'Which word begins with the m sound?', ur: 'کون سا لفظ م کی آواز سے شروع ہوتا ہے؟' }, hint: { en: 'Say each word out loud.', ur: 'ہر لفظ اونچی آواز میں کہیں۔' } },
  'missing-number': { title: { en: 'Number Path', ur: 'نمبروں کا راستہ' }, instruction: { en: 'What number is missing: one, two, blank, four?', ur: 'ایک، دو، خالی، چار میں کون سا نمبر گم ہے؟' }, hint: { en: 'Count forward from one.', ur: 'ایک سے آگے گنیں۔' } },
  'picture-addition': { title: { en: 'Picture Addition', ur: 'تصویری جمع' }, instruction: { en: 'What is two apples plus one apple?', ur: 'دو سیب جمع ایک سیب کتنے ہوئے؟' }, hint: { en: 'Put the apples together.', ur: 'سیبوں کو ایک ساتھ گنیں۔' } },
  'pattern': { title: { en: 'Pattern Path', ur: 'ترتیب کا راستہ' }, instruction: { en: 'What comes next in the pattern?', ur: 'ترتیب میں اگلا کیا آئے گا؟' }, hint: { en: 'The colors take turns.', ur: 'رنگ باری باری آتے ہیں۔' } },
};

function content(id: string, title: string, prompt: string, hint: string): TaskContent {
  const specific = urdu[id] || {};
  const clean = (value: LocalizedText): LocalizedText => ({ en: value.en, ur: repairMojibake(value.ur) });
  return { title: clean(specific.title || { en: title, ur: title }), instruction: clean(specific.instruction || { en: prompt, ur: 'تصویر دیکھیں اور صحیح جواب دبائیں۔' }), hint: clean(specific.hint || { en: hint, ur: 'اشارے کو غور سے سنیں۔' }), success: clean(specific.success || { en: 'Great job! That is correct.', ur: 'شاباش! یہ صحیح جواب ہے۔' }), retry: clean({ en: 'Try again. You can do it!', ur: 'دوبارہ کوشش کریں، آپ کر سکتے ہیں!' }), audioId: { en: `task-${id}`, ur: `task-${id}` } };
}
const task = (id: string, title: string, subject: string, type: TaskType, prompt: string, hint: string, answer: string, options: TaskOption[], reward = 2, coins = 8): Task => ({ id, title, subject, type, prompt, hint, answer, options, reward, coins, content: content(id, title, prompt, hint) });

const common = [
  task('match-a', 'ABC Adventure', 'Letters', 'multiple-choice', 'Find the picture that starts with A', 'Listen for the A sound.', 'Apple', [{ emoji: '🍎', word: 'Apple', wordUr: 'سیب' }, { emoji: '🐝', word: 'Bee', wordUr: 'شہد کی مکھی' }, { emoji: '🐱', word: 'Cat', wordUr: 'بلی' }], 3, 12),
  task('count-stars', 'Count the Stars', 'Numbers', 'counting', 'How many stars can you see?', 'Count each star slowly.', '5', [{ emoji: '⭐', word: '3' }, { emoji: '⭐⭐⭐⭐⭐', word: '5' }, { emoji: '⭐⭐⭐⭐', word: '4' }]),
  task('color-sort', 'Color Garden', 'Colors', 'sorting', 'Which one is blue?', 'Look for the color of the sky.', 'Blue', [{ emoji: '🔵', word: 'Blue', wordUr: 'نیلا' }, { emoji: '🟡', word: 'Yellow', wordUr: 'پیلا' }, { emoji: '🔴', word: 'Red', wordUr: 'لال' }]),
  task('shape-friend', 'Shape Safari', 'Shapes', 'matching-pairs', 'Which picture is a circle?', 'A circle is round all the way around.', 'Circle', [{ emoji: '⚪', word: 'Circle', wordUr: 'دائرہ' }, { emoji: '🔺', word: 'Triangle', wordUr: 'مثلث' }, { emoji: '🟦', word: 'Square', wordUr: 'مربع' }]),
  task('big-small', 'Big or Small', 'Thinking', 'multiple-choice', 'Which animal is big?', 'Think about the animal that needs the most space.', 'Elephant', [{ emoji: '🐘', word: 'Elephant', wordUr: 'ہاتھی' }, { emoji: '🐭', word: 'Mouse', wordUr: 'چوہا' }, { emoji: '🐜', word: 'Ant', wordUr: 'چیونٹی' }]),
];
const nursery = [
  task('upper-lower', 'Letter Friends', 'Letters', 'matching-pairs', 'Match the uppercase A with its lowercase friend.', 'Uppercase A and lowercase a are friends.', 'a', [{ emoji: '🔤', word: 'a' }, { emoji: '💡', word: 'b' }, { emoji: '🔠', word: 'c' }]),
  task('missing-letter', 'Missing Letter', 'Letters', 'multiple-choice', 'What letter comes after A?', 'Say A, then the next letter.', 'B', [{ emoji: '🅱️', word: 'B' }, { emoji: '©️', word: 'C' }, { emoji: '🅰️', word: 'A' }]),
  task('number-quantity', 'Number Meadow', 'Numbers', 'counting', 'Which group shows 6?', 'Count the dots in each group.', '6', [{ emoji: '•••', word: '3' }, { emoji: '••••••', word: '6' }, { emoji: '••••', word: '4' }]),
  task('word-picture', 'Word Picnic', 'Words', 'multiple-choice', 'Which picture matches sun?', 'The sun shines in the sky.', 'Sun', [{ emoji: '☀️', word: 'Sun' }, { emoji: '🌧️', word: 'Rain' }, { emoji: '🌙', word: 'Moon' }]),
  task('memory-cards', 'Memory Garden', 'Memory', 'memory', 'Find the matching pair.', 'Look carefully and remember.', 'Butterfly', [{ emoji: '🦋', word: 'Butterfly' }, { emoji: '🌼', word: 'Flower' }, { emoji: '🐞', word: 'Ladybug' }]),
];
const prep = [
  task('word-builder', 'Word Builder', 'Reading', 'multiple-choice', 'Which word starts with c-a-t?', 'Blend the sounds c, a, t.', 'CAT', [{ emoji: '🐱', word: 'CAT' }, { emoji: '🐶', word: 'DOG' }, { emoji: '🐝', word: 'BEE' }]),
  task('beginning-sound', 'Sound Detective', 'Reading', 'listen-select', 'Which word begins with the m sound?', 'Say each word out loud.', 'Moon', [{ emoji: '🌙', word: 'Moon' }, { emoji: '☀️', word: 'Sun' }, { emoji: '🐟', word: 'Fish' }]),
  task('missing-number', 'Number Path', 'Maths', 'multiple-choice', 'What number is missing: 1, 2, __, 4?', 'Count forward from one.', '3', [{ emoji: '3️⃣', word: '3' }, { emoji: '5️⃣', word: '5' }, { emoji: '1️⃣', word: '1' }]),
  task('picture-addition', 'Picture Addition', 'Maths', 'counting', 'What is 2 apples plus 1 apple?', 'Put the apples together.', '3', [{ emoji: '🍎🍎🍎', word: '3' }, { emoji: '🍎🍎', word: '2' }, { emoji: '🍎🍎🍎🍎', word: '4' }]),
  task('pattern', 'Pattern Path', 'Thinking', 'sequencing', 'What comes next: blue, yellow, blue, blank?', 'The colors take turns.', 'Yellow', [{ emoji: '🟡', word: 'Yellow' }, { emoji: '🔵', word: 'Blue' }, { emoji: '🟢', word: 'Green' }]),
];

export const tasksFor = (level: ClassLevel): Task[] => level === 'Nursery' ? nursery : level === 'Prep' ? prep : common;
export const allTasks = [...common, ...nursery, ...prep];
export const taskText = (task: Task, language: LanguageMode, field: keyof Omit<TaskContent, 'audioId'>): string => language === 'ur' ? task.content[field].ur : language === 'bilingual' ? `${task.content[field].en}۔ ${task.content[field].ur}` : task.content[field].en;
