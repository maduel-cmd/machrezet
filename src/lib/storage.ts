import type { Creation, PlayerProfile } from './types';

export const STORAGE_KEY = 'machrezet-creations-v1';
export const PROFILE_STORAGE_KEY = 'machrezet-player-profile-v1';
/** תאריך תפוגה ליצירות שמורות לנצח (JSON-safe) */
export const FOREVER_EXPIRES_AT = Number.MAX_SAFE_INTEGER;

export const PROFILE_NAME_MAX = 24;
export const PROFILE_USERNAME_MIN = 3;
export const PROFILE_USERNAME_MAX = 64;
export const PROFILE_PASSWORD_MIN = 4;
export const PROFILE_PASSWORD_MAX = 32;
export const PROFILE_AGE_MIN = 3;
export const PROFILE_AGE_MAX = 99;
/** גודל מקסימלי לתמונת פרופיל ב־data URL (בערך אחרי דחיסה) */
export const PROFILE_PHOTO_MAX_CHARS = 350_000;

const HANDLE_RE = /^[\p{L}\p{N}_.-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUsername(u: string): boolean {
  if (u.length < PROFILE_USERNAME_MIN || u.length > PROFILE_USERNAME_MAX) return false;
  if (u.includes('@')) return EMAIL_RE.test(u);
  return HANDLE_RE.test(u);
}

export function nowMs(): number {
  return Date.now();
}

export function emptyProfile(now = nowMs()): PlayerProfile {
  return {
    displayName: '',
    username: '',
    age: null,
    photoDataUrl: null,
    passwordSalt: null,
    passwordHash: null,
    updatedAt: now,
  };
}

export function normalizeUsername(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const u = raw.trim().slice(0, PROFILE_USERNAME_MAX);
  if (!isValidUsername(u)) return '';
  return u;
}

export function normalizeProfile(raw: unknown, now = nowMs()): PlayerProfile {
  const base = emptyProfile(now);
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  const name = typeof o.displayName === 'string' ? o.displayName.trim().slice(0, PROFILE_NAME_MAX) : '';
  const username = normalizeUsername(o.username);
  let age: number | null = null;
  if (typeof o.age === 'number' && Number.isFinite(o.age)) {
    const rounded = Math.round(o.age);
    if (rounded >= PROFILE_AGE_MIN && rounded <= PROFILE_AGE_MAX) age = rounded;
  }
  let photo: string | null = null;
  if (typeof o.photoDataUrl === 'string' && o.photoDataUrl.startsWith('data:image/')) {
    if (o.photoDataUrl.length <= PROFILE_PHOTO_MAX_CHARS) photo = o.photoDataUrl;
  }
  let passwordSalt: string | null = null;
  let passwordHash: string | null = null;
  if (
    typeof o.passwordSalt === 'string' &&
    typeof o.passwordHash === 'string' &&
    /^[a-f0-9]{16,128}$/i.test(o.passwordSalt) &&
    /^[a-f0-9]{32,128}$/i.test(o.passwordHash)
  ) {
    passwordSalt = o.passwordSalt.toLowerCase();
    passwordHash = o.passwordHash.toLowerCase();
  }
  // סיסמה תקפה רק עם שם משתמש
  if (!username || !passwordSalt || !passwordHash) {
    passwordSalt = null;
    passwordHash = null;
  }
  const updatedAt = typeof o.updatedAt === 'number' && Number.isFinite(o.updatedAt) ? o.updatedAt : now;
  return {
    displayName: name,
    username,
    age,
    photoDataUrl: photo,
    passwordSalt,
    passwordHash,
    updatedAt,
  };
}

export function loadProfile(
  storage: Pick<Storage, 'getItem'> = localStorage,
  now = nowMs(),
): PlayerProfile {
  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return emptyProfile(now);
    return normalizeProfile(JSON.parse(raw) as unknown, now);
  } catch {
    return emptyProfile(now);
  }
}

export function saveProfile(
  profile: PlayerProfile,
  storage: Pick<Storage, 'setItem'> = localStorage,
  now = nowMs(),
): PlayerProfile {
  const next = normalizeProfile({ ...profile, updatedAt: now }, now);
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function profileIsSet(profile: PlayerProfile): boolean {
  return (
    Boolean(profile.displayName.trim()) ||
    Boolean(profile.username.trim()) ||
    profile.age != null ||
    Boolean(profile.photoDataUrl)
  );
}

export function validateUsernameInput(raw: string): string | null {
  const u = raw.trim();
  if (!u) return null; // ריק = אופציונלי
  if (u.length < PROFILE_USERNAME_MIN || u.length > PROFILE_USERNAME_MAX) {
    return `שם משתמש: ${PROFILE_USERNAME_MIN}–${PROFILE_USERNAME_MAX} תווים`;
  }
  if (!isValidUsername(u)) {
    return 'שם משתמש: כינוי או כתובת אימייל תקינה';
  }
  return null;
}

export function validatePasswordInput(raw: string, { required }: { required: boolean }): string | null {
  if (!raw) {
    return required ? 'נא להזין סיסמה' : null;
  }
  if (raw.length < PROFILE_PASSWORD_MIN || raw.length > PROFILE_PASSWORD_MAX) {
    return `סיסמה: ${PROFILE_PASSWORD_MIN}–${PROFILE_PASSWORD_MAX} תווים`;
  }
  return null;
}

export function isPermanentCreation(_c?: Pick<Creation, 'permanent' | 'expiresAt'>): boolean {
  return true;
}

/** כל היצירות נשמרות לנצח במכשיר — ממירים גם ישנות מתקופת 14 הימים */
export function normalizeCreation(raw: Creation): Creation {
  return {
    ...raw,
    permanent: true,
    expiresAt: FOREVER_EXPIRES_AT,
  };
}

/** נשמר לתאימות לבדיקות ישנות — כבר לא מוחק לפי תאריך */
export function pruneExpired(creations: Creation[], _now = nowMs()): Creation[] {
  return creations.map(normalizeCreation);
}

export function loadCreations(
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = nowMs(),
): Creation[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Creation[];
    if (!Array.isArray(parsed)) return [];
    const normalized = pruneExpired(parsed, now);
    const needsMigrate = parsed.some((c) => !c.permanent || c.expiresAt < FOREVER_EXPIRES_AT);
    if (needsMigrate && 'setItem' in storage) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        /* מכשיר מלא / פרטי — עדיין מחזירים את הרשימה בזיכרון */
      }
    }
    return normalized;
  } catch {
    return [];
  }
}

export function saveCreations(
  creations: Creation[],
  storage: Pick<Storage, 'setItem'> = localStorage,
  now = nowMs(),
): Creation[] {
  const next = pruneExpired(creations, now);
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function addCreation(
  creation: Omit<Creation, 'id' | 'createdAt' | 'expiresAt' | 'permanent'> & {
    id?: string;
    permanent?: boolean;
  },
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = nowMs(),
): Creation {
  const full: Creation = {
    ...creation,
    permanent: true,
    id: creation.id ?? `c-${now}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    expiresAt: FOREVER_EXPIRES_AT,
  };
  const existing = loadCreations(storage, now);
  saveCreations([full, ...existing], storage, now);
  return full;
}

export function deleteCreation(
  id: string,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = nowMs(),
): Creation[] {
  const next = loadCreations(storage, now).filter((c) => c.id !== id);
  return saveCreations(next, storage, now);
}

/** @deprecated הכל כבר לנצח — נשאר לתאימות */
export function makeCreationPermanent(
  id: string,
  storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage,
  now = nowMs(),
): Creation[] {
  const next = loadCreations(storage, now).map((c) =>
    c.id === id ? normalizeCreation(c) : c,
  );
  return saveCreations(next, storage, now);
}

export function daysLeft(_expiresAt: number, _now = nowMs()): number {
  return Number.POSITIVE_INFINITY;
}

export function retentionLabel(
  _c?: Pick<Creation, 'permanent' | 'expiresAt'>,
  _now = nowMs(),
): string {
  return 'נשמר לנצח במכשיר';
}
