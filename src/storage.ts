export type ClassLevel = 'Play Group' | 'Pre-Nursery' | 'Nursery' | 'Prep';

export type AssignedTask = {
  id: string;
  title: string;
  difficulty: 'Gentle' | 'Growing' | 'Challenge';
  target: number;
  completed: number;
  subject: string;
};

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  classLevel: ClassLevel;
  age?: string;
  stars: number;
  coins: number;
  badges: string[];
  completed: number;
  accuracy: number;
  attempts: number;
  streak: number;
  mastered: string[];
  practice: string[];
  recent: string[];
  unlocked: string[];
  dailyTaskIds: string[];
  completedTaskIds: string[];
  dailyCompleted: number;
  assignedTasks: AssignedTask[];
  lastPlayedActivity: string;
  resumePosition: number;
  lastPlayedAt: string;
};

export type Store = { version: 1; initialized: boolean; activeProfileId: string | null; parentPinHash: string | null; profiles: Profile[] };

const KEY = 'little-stars-store';
const LEGACY_KEY = 'little-stars-progress';
const avatarOptions = ['🦊', '🐼', '🐨', '🦁', '🐰', '🐯'];
export const avatars = avatarOptions;

export function newProfile(name: string, classLevel: ClassLevel, avatar = avatarOptions[0], age?: string): Profile {
  const now = new Date().toISOString();
  return { id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: name.trim(), avatar, classLevel, age, stars: 0, coins: 0, badges: [], completed: 0, accuracy: 0, attempts: 0, streak: 0, mastered: [], practice: ['Letter sounds', 'Shapes', 'Counting'], recent: [], unlocked: ['Welcome Home'], dailyTaskIds: [], completedTaskIds: [], dailyCompleted: 0, assignedTasks: [], lastPlayedActivity: 'Not started yet', resumePosition: 0, lastPlayedAt: now };
}

const sampleTaha = (): Profile => ({ ...newProfile('Taha', 'Pre-Nursery', '🦊', '4'), stars: 8, coins: 42, badges: ['First Star'], completed: 3, accuracy: 88, attempts: 7, streak: 2, mastered: ['Colors', 'Counting to 10', 'Letter A'], recent: ['Completed Letter A Matching', 'Earned a gold star', 'Practiced counting'], unlocked: ['Welcome Home', 'Letter Island', 'Number Meadow'], dailyCompleted: 3, lastPlayedActivity: 'ABC Adventure: Matching' });
const sampleUzair = (): Profile => ({ ...newProfile('Uzair', 'Nursery', '🐼', '5'), stars: 4, coins: 21, badges: [], completed: 1, accuracy: 76, attempts: 4, streak: 1, mastered: ['Colors'], recent: ['Completed Color Sort'], unlocked: ['Welcome Home', 'Letter Island'], lastPlayedActivity: 'Color Sort' });

function migrateLegacy(): Store | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as Partial<Profile>;
    const profile = { ...newProfile('Taha', legacy.classLevel || 'Pre-Nursery', '🦊'), ...legacy, id: 'child-taha-migrated', name: 'Taha' };
    return { version: 1, initialized: true, activeProfileId: profile.id, parentPinHash: null, profiles: [normalizeProfile(profile)] };
  } catch { return null; }
}

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Store>;
      if (parsed.version === 1 && Array.isArray(parsed.profiles)) return { version: 1, initialized: Boolean(parsed.initialized), activeProfileId: parsed.activeProfileId || parsed.profiles[0]?.id || null, parentPinHash: parsed.parentPinHash || null, profiles: parsed.profiles.map((profile) => normalizeProfile(profile as Profile)) };
    }
  } catch { /* Recover with safe defaults below. */ }
  return migrateLegacy() || { version: 1, initialized: true, activeProfileId: null, parentPinHash: null, profiles: [sampleTaha(), sampleUzair()] };
}

export async function hashPin(pin: string) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''); }

function normalizeProfile(profile: Profile): Profile {
  return { ...newProfile(profile.name || 'Little Star', profile.classLevel || 'Pre-Nursery', profile.avatar || avatarOptions[0], profile.age), ...profile, badges: profile.badges || [], mastered: profile.mastered || [], practice: profile.practice || [], recent: profile.recent || [], unlocked: profile.unlocked || ['Welcome Home'], dailyTaskIds: profile.dailyTaskIds || [], completedTaskIds: profile.completedTaskIds || [], dailyCompleted: profile.dailyCompleted || 0, assignedTasks: profile.assignedTasks || [], attempts: profile.attempts || 0, streak: profile.streak || 0, resumePosition: profile.resumePosition || 0 };
}

export function saveStore(store: Store) { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* Private browsing should not block play. */ } }

export function profileToProgress(profile: Profile) { return { ...profile, badges: profile.badges, dailyTasks: profile.dailyTaskIds, dailyCompleted: profile.dailyCompleted }; }
