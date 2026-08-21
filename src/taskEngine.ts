import type { ClassLevel } from './storage';

export type TaskType = 'multiple-choice' | 'matching-pairs' | 'sorting' | 'sequencing' | 'counting' | 'tracing' | 'listen-select' | 'memory';
export type TaskOption = { emoji: string; word: string };
export type Task = { id: string; title: string; subject: string; type: TaskType; prompt: string; hint: string; answer: string; options: TaskOption[]; reward: number; coins: number };

const task = (id: string, title: string, subject: string, type: TaskType, prompt: string, hint: string, answer: string, options: TaskOption[], reward = 2, coins = 8): Task => ({ id, title, subject, type, prompt, hint, answer, options, reward, coins });

const common = [
  task('match-a', 'ABC Adventure', 'Letters', 'multiple-choice', 'Find the picture that starts with A', 'Listen for the /a/ sound.', 'Apple', [{ emoji: '🍎', word: 'Apple' }, { emoji: '🐝', word: 'Bee' }, { emoji: '🐱', word: 'Cat' }], 3, 12),
  task('count-stars', 'Count the Stars', 'Numbers', 'counting', 'How many stars can you see?', 'Count each star slowly.', '5', [{ emoji: '⭐', word: '3' }, { emoji: '⭐⭐⭐⭐⭐', word: '5' }, { emoji: '⭐⭐⭐⭐', word: '4' }]),
  task('color-sort', 'Color Garden', 'Colors', 'sorting', 'Which one is blue?', 'Look for the color of the sky.', 'Blue', [{ emoji: '🔵', word: 'Blue' }, { emoji: '🟡', word: 'Yellow' }, { emoji: '🔴', word: 'Red' }]),
  task('shape-friend', 'Shape Safari', 'Shapes', 'matching-pairs', 'Which picture is a circle?', 'A circle is round all the way around.', 'Circle', [{ emoji: '⚪', word: 'Circle' }, { emoji: '🔺', word: 'Triangle' }, { emoji: '🟦', word: 'Square' }]),
  task('big-small', 'Big or Small', 'Thinking', 'multiple-choice', 'Which animal is big?', 'Think about the animal that needs the most space.', 'Elephant', [{ emoji: '🐘', word: 'Elephant' }, { emoji: '🐭', word: 'Mouse' }, { emoji: '🐜', word: 'Ant' }]),
];

const nursery = [
  task('upper-lower', 'Letter Friends', 'Letters', 'matching-pairs', 'Match the uppercase A with its lowercase friend.', 'Uppercase A and lowercase a are friends.', 'a', [{ emoji: '🔤', word: 'a' }, { emoji: '🔡', word: 'b' }, { emoji: '🔠', word: 'c' }]),
  task('missing-letter', 'Missing Letter', 'Letters', 'multiple-choice', 'What letter comes after A?', 'Say A, then the next letter.', 'B', [{ emoji: '🅱️', word: 'B' }, { emoji: '©️', word: 'C' }, { emoji: '🅰️', word: 'A' }]),
  task('number-quantity', 'Number Meadow', 'Numbers', 'counting', 'Which group shows 6?', 'Count the dots in each group.', '6', [{ emoji: '●●●', word: '3' }, { emoji: '●●●●●●', word: '6' }, { emoji: '●●●●', word: '4' }]),
  task('word-picture', 'Word Picnic', 'Words', 'multiple-choice', 'Which picture matches “sun”?', 'The sun shines in the sky.', 'Sun', [{ emoji: '☀️', word: 'Sun' }, { emoji: '🌧️', word: 'Rain' }, { emoji: '🌙', word: 'Moon' }]),
  task('memory-cards', 'Memory Garden', 'Memory', 'memory', 'Find the matching pair.', 'Look carefully and remember.', 'Butterfly', [{ emoji: '🦋', word: 'Butterfly' }, { emoji: '🌼', word: 'Flower' }, { emoji: '🐞', word: 'Ladybug' }]),
];

const prep = [
  task('word-builder', 'Word Builder', 'Reading', 'multiple-choice', 'Which word starts with c-a-t?', 'Blend the sounds c, a, t.', 'CAT', [{ emoji: '🐱', word: 'CAT' }, { emoji: '🐶', word: 'DOG' }, { emoji: '🐝', word: 'BEE' }]),
  task('beginning-sound', 'Sound Detective', 'Reading', 'listen-select', 'Which word begins with /m/?', 'Say each word out loud.', 'Moon', [{ emoji: '🌙', word: 'Moon' }, { emoji: '☀️', word: 'Sun' }, { emoji: '🐟', word: 'Fish' }]),
  task('missing-number', 'Number Path', 'Maths', 'multiple-choice', 'What number is missing: 1, 2, __, 4?', 'Count forward from one.', '3', [{ emoji: '3️⃣', word: '3' }, { emoji: '5️⃣', word: '5' }, { emoji: '1️⃣', word: '1' }]),
  task('picture-addition', 'Picture Addition', 'Maths', 'counting', 'What is 2 apples plus 1 apple?', 'Put the apples together.', '3', [{ emoji: '🍎🍎🍎', word: '3' }, { emoji: '🍎🍎', word: '2' }, { emoji: '🍎🍎🍎🍎', word: '4' }]),
  task('pattern', 'Pattern Path', 'Thinking', 'sequencing', 'What comes next: 🔵 🟡 🔵 __?', 'The colors take turns.', 'Yellow', [{ emoji: '🟡', word: 'Yellow' }, { emoji: '🔵', word: 'Blue' }, { emoji: '🟢', word: 'Green' }]),
];

export const tasksFor = (level: ClassLevel): Task[] => level === 'Nursery' ? nursery : level === 'Prep' ? prep : common;
export const allTasks = [...common, ...nursery, ...prep];
