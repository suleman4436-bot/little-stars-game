import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import type { LanguageMode, VoicePreferences } from './storage';
import type { MemoryPair } from './taskEngine';
import { useVoice, VoiceControls } from './voice';

const shuffle = <T,>(items: T[]) => { const copy = [...items]; for (let index = copy.length - 1; index > 0; index -= 1) { const randomIndex = Math.floor(Math.random() * (index + 1)); [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]; } return copy; };

export function MemoryGame({ language, pairs, preferences, round, onComplete }: { language: LanguageMode; pairs: MemoryPair[]; preferences: VoicePreferences; round: number; onComplete: (attempts: number) => void }) {
  const voice = useVoice();
  const cardsForRound = useMemo(() => shuffle(pairs.flatMap((pair) => [{ ...pair, cardId: `${pair.id}-a` }, { ...pair, cardId: `${pair.id}-b` }])).map((card) => ({ ...card, open: false, matched: false })), [pairs, round]);
  const [cards, setCards] = useState(cardsForRound); const [openIds, setOpenIds] = useState<string[]>([]); const [locked, setLocked] = useState(false); const [attempts, setAttempts] = useState(0);
  useEffect(() => { setCards(cardsForRound); setOpenIds([]); setLocked(false); setAttempts(0); }, [cardsForRound]);
  useEffect(() => () => setLocked(false), []);
  const speak = (message: string) => { voice.unlock(); voice.speak(message, language, { key: `memory-${round}-${message}`, speed: preferences.speed, volume: preferences.volume }); };
  const choose = (cardId: string) => {
    if (locked || openIds.length >= 2) return;
    const card = cards.find((item) => item.cardId === cardId); if (!card || card.open || card.matched) return;
    const nextOpen = [...openIds, cardId]; setOpenIds(nextOpen); setCards((old) => old.map((item) => item.cardId === cardId ? { ...item, open: true } : item));
    if (nextOpen.length !== 2) return;
    setLocked(true); const nextAttempts = attempts + 1; setAttempts(nextAttempts); const selected = cards.filter((item) => nextOpen.includes(item.cardId));
    window.setTimeout(() => { const matched = selected[0].id === selected[1].id; setCards((old) => old.map((item) => nextOpen.includes(item.cardId) ? { ...item, open: matched, matched } : item)); setOpenIds([]); setLocked(false); if (matched) speak(language === 'ur' ? 'شاباش! جوڑا مل گیا۔' : 'Great match!'); if (matched && cards.filter((item) => item.matched || nextOpen.includes(item.cardId)).length === cards.length) onComplete(nextAttempts); }, 650);
  };
  const completeCount = cards.filter((card) => card.matched).length;
  return <section className="page game-page memory-page" dir={language === 'ur' ? 'rtl' : 'ltr'}><div className="game-top"><span className="game-stars">{language === 'ur' ? `جوڑے: ${completeCount / 2} / ${pairs.length}` : `Pairs: ${completeCount / 2} / ${pairs.length}`}</span><span>{language === 'ur' ? `کوششیں: ${attempts}` : `Attempts: ${attempts}`}</span></div><div className="game-card"><h2>{language === 'ur' ? 'دو کارڈ پلٹیں اور ایک جیسی تصویریں تلاش کریں۔' : 'Turn over two cards and find the matching pictures.'}</h2><div className="memory-grid">{cards.map((card) => <button className={`memory-card ${card.open || card.matched ? 'open' : ''}`} key={card.cardId} onClick={() => choose(card.cardId)} disabled={locked || card.open || card.matched}><span>{card.open || card.matched ? card.emoji : '❓'}</span><strong>{card.open || card.matched ? (language === 'ur' ? card.ur : card.en) : ''}</strong></button>)}</div></div><div className="game-footer"><VoiceControls language={language} preferences={preferences} compact={false} /><button className="text-btn" onClick={() => speak(language === 'ur' ? 'دو کارڈ پلٹیں اور ایک جیسی تصویریں تلاش کریں۔' : 'Turn over two cards and find the matching pictures.')}><Volume2 size={17} /> {language === 'ur' ? 'دوبارہ سنیں' : 'Listen Again'}</button><button className="text-btn" onClick={() => { setCards(cardsForRound); setOpenIds([]); setLocked(false); setAttempts(0); }}><RotateCcw size={17} /> {language === 'ur' ? 'دوبارہ شروع کریں' : 'Restart'}</button></div></section>;
}
