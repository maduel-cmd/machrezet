import { PRODUCT_LABELS } from '../data/beads';
import type { ProductKind } from './types';

/** שם ברירת מחדל ליצירה — כולל שם השחקן אם הוגדר */
export function defaultCreationName(kind: ProductKind, displayName: string): string {
  const who = displayName.trim();
  const label = PRODUCT_LABELS[kind];
  return who ? `${label} של ${who}` : `${label} שלי`;
}

/** האם השם הנוכחי הוא עדיין ברירת מחדל (לא נערך ידנית) */
export function isDefaultCreationName(name: string, displayName: string): boolean {
  const trimmed = name.trim();
  if (!trimmed) return true;
  const kinds: ProductKind[] = ['bracelet', 'necklace', 'ornament'];
  return kinds.some((k) => defaultCreationName(k, displayName) === trimmed);
}
