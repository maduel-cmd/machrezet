/** סוגי מוצר ומבני נתונים למשחק החרוזים */

export type ProductKind = 'bracelet' | 'necklace' | 'ornament';

export type BeadCategory =
  | 'pony'
  | 'letter'
  | 'gemstone'
  | 'pearl'
  | 'heishi'
  | 'crystal'
  | 'metal'
  | 'wood'
  | 'charm'
  | 'seed';

export type BeadShape =
  | 'round'
  | 'cube'
  | 'disc'
  | 'faceted'
  | 'star'
  | 'heart'
  | 'tube'
  | 'oval'
  | 'leaf'
  | 'shell'
  | 'flower';

export interface BeadDef {
  id: string;
  nameHe: string;
  category: BeadCategory;
  shape: BeadShape;
  /** צבע בסיס לציור */
  color: string;
  /** הדגשה / ברק */
  highlight?: string;
  letter?: string;
  size: 'xs' | 'sm' | 'md' | 'lg';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  /** SVG וקטורי מלא לצ'ארמי עולם (מחרוזת markup) */
  svgMarkup?: string;
}

/** מופע חרוז על החוט */
export interface PlacedBead {
  instanceId: string;
  beadId: string;
}

export interface Creation {
  id: string;
  name: string;
  kind: ProductKind;
  beads: PlacedBead[];
  cordColor: string;
  createdAt: number;
  /** תפוגה — תמיד לנצח במכשיר */
  expiresAt: number;
  /** שמירה לנצח במכשיר */
  permanent?: boolean;
  source: 'free' | 'copy' | 'request';
  score?: number;
  /** האם התכשיט סגור (תצוגת גיבור) — אופציונלי לתאימות לאחור */
  closed?: boolean;
}

export interface CopyChallenge {
  id: string;
  titleHe: string;
  kind: ProductKind;
  cordColor: string;
  beadIds: string[];
  hintHe?: string;
}

export interface RequestChallenge {
  id: string;
  titleHe: string;
  kind: ProductKind;
  briefHe: string;
  /** דרישות לניקוד */
  rules: RequestRules;
}

export interface RequestRules {
  minBeads: number;
  maxBeads: number;
  requiredCategories?: BeadCategory[];
  requiredLetters?: string[];
  preferredColors?: string[];
  forbiddenCategories?: BeadCategory[];
  mustIncludeBeadIds?: string[];
  gemstoneCountMin?: number;
  letterWord?: string;
}

export type Screen =
  | { name: 'home' }
  | { name: 'free' }
  | { name: 'copy'; challengeId?: string }
  | { name: 'request'; challengeId?: string }
  | { name: 'gallery' }
  | { name: 'profile' }
  | { name: 'result'; score: number; message: string; creationId?: string };

/** פרופיל שחקן מקומי — בלי חשבון/ענן */
export interface PlayerProfile {
  displayName: string;
  /** שם משתמש מקומי (כניסה במכשיר) */
  username: string;
  /** גיל בשנים; null = לא הוגדר */
  age: number | null;
  /** תמונה כ־data URL (jpeg/png/webp) — אופציונלי */
  photoDataUrl: string | null;
  /** מלח + גיבוב סיסמה מקומית — לעולם לא סיסמה גולמית */
  passwordSalt: string | null;
  passwordHash: string | null;
  updatedAt: number;
}
