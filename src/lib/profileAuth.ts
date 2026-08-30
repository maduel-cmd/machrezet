/** אימות מקומי לפרופיל מחרזת — סיסמה מגובבת, בלי ענן */

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return toHex(buf.buffer);
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

export async function hashPassword(
  password: string,
  salt = randomSalt(),
): Promise<{ salt: string; hash: string }> {
  const hash = await sha256Hex(`${salt}:${password}`);
  return { salt, hash };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  if (!salt || !expectedHash) return false;
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

export const SESSION_STORAGE_KEY = 'machrezet-local-session-v1';

export function isSessionUnlocked(
  username: string,
  storage: Pick<Storage, 'getItem'> = sessionStorage,
): boolean {
  const u = username.trim().toLowerCase();
  if (!u) return false;
  try {
    return storage.getItem(SESSION_STORAGE_KEY) === u;
  } catch {
    return false;
  }
}

export function unlockSession(
  username: string,
  storage: Pick<Storage, 'setItem'> = sessionStorage,
): void {
  storage.setItem(SESSION_STORAGE_KEY, username.trim().toLowerCase());
}

export function lockSession(storage: Pick<Storage, 'removeItem'> = sessionStorage): void {
  storage.removeItem(SESSION_STORAGE_KEY);
}

export function profileHasCredentials(profile: {
  username: string;
  passwordHash: string | null;
  passwordSalt: string | null;
}): boolean {
  return Boolean(profile.username.trim() && profile.passwordHash && profile.passwordSalt);
}
