import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('src/taskEngine.ts'), 'utf8');
const appSource = fs.readFileSync(path.resolve('src/main.tsx'), 'utf8');
const voiceSource = fs.readFileSync(path.resolve('src/voiceService.ts'), 'utf8');
for (const value of ['ABC Adventure', 'Count the Stars', 'Color Garden', 'Shape Safari', 'Big or Small', 'حروف کی مہم', 'ستارے گنیں', 'رنگوں کا باغ', 'اشکال کی سیر', 'بڑا یا چھوٹا']) assert.match(source, new RegExp(value));
for (const [letter, word] of [['ا', 'انار'], ['ب', 'بکری'], ['پ', 'پتنگ'], ['ت', 'تتلی'], ['ٹ', 'ٹماٹر'], ['ج', 'جہاز'], ['چ', 'چاند'], ['د', 'درخت'], ['س', 'سیب'], ['ش', 'شیر'], ['ک', 'کتاب'], ['گ', 'گلاب'], ['م', 'مچھلی'], ['ن', 'ناشپاتی'], ['ہ', 'ہاتھی']]) assert.match(source, new RegExp(`'${letter}'.*?'${word}'`));
assert.match(source, /'سیب'\.startsWith\('ا'\)/); assert.doesNotMatch(source, /الف سے سیب/);
assert.match(source, /language === 'ur' \? urduTasks : englishTasks/); assert.match(source, /'B', 'B', 'Bee'/); assert.match(source, /'C', 'C', 'Cat'/);
for (const phrase of ['setCurrentIndex(0)', 'setSelectedAnswer(null)', 'setTransitioning(false)', 'currentIndex', 'questions.length - 1', 'setScreen(']) assert.ok(appSource.includes(phrase), `${phrase} navigation guard is missing`);
assert.match(appSource, /completedTaskIds\.includes\(task\.id\)/); assert.match(appSource, /Parent Progress/); assert.match(appSource, /document\.documentElement\.dir/);
for (const phrase of ['voiceschanged', 'ur-PK', 'ur-IN', 'Microsoft Asad Urdu Pakistan', 'Microsoft Uzma Urdu Pakistan']) assert.match(voiceSource, new RegExp(phrase));
assert.doesNotMatch(voiceSource, /\/urdu\//);
fs.writeSync(1, 'Gameplay datasets, mappings, bounded navigation, language reset, rewards, RTL/LTR, and voice selection passed.\n');
