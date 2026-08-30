import { CATEGORY_LABELS, getBead } from '../data/beads';
import type { BeadCategory, PlacedBead, RequestRules } from './types';

export type ChecklistStatus = 'done' | 'partial' | 'todo' | 'warn';

export interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  status: ChecklistStatus;
}

function lettersOnStrand(beads: PlacedBead[]): string[] {
  return beads
    .map((p) => getBead(p.beadId)?.letter)
    .filter((l): l is string => Boolean(l));
}

function containsSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return true;
  if (needle.length > haystack.length) return false;
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let ok = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function countCovered(needed: string[], availableLetters: string[]): number {
  const available = [...availableLetters];
  let covered = 0;
  for (const ch of needed) {
    const idx = available.indexOf(ch);
    if (idx >= 0) {
      covered++;
      available.splice(idx, 1);
    }
  }
  return covered;
}

/**
 * צ׳ק־ליסט התקדמות חי — תצוגה בלבד.
 * לא משנה ניקוד / validation (scoreRequest נשאר המקור לציון).
 */
export function buildRequestChecklist(beads: PlacedBead[], rules: RequestRules): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const defs = beads.map((b) => getBead(b.beadId)).filter(Boolean);
  const categories = new Set(defs.map((d) => d!.category));
  const beadIds = new Set(beads.map((b) => b.beadId));
  const letters = lettersOnStrand(beads);
  const gemCount = defs.filter((d) => d!.category === 'gemstone').length;
  const n = beads.length;

  // אורך
  {
    const inRange = n >= rules.minBeads && n <= rules.maxBeads;
    const under = n < rules.minBeads;
    items.push({
      id: 'length',
      label: `אורך: ${rules.minBeads}–${rules.maxBeads} חרוזים`,
      detail: under
        ? `${n}/${rules.minBeads} (עדיין קצר)`
        : n > rules.maxBeads
          ? `${n} — יותר מהמקסימום ${rules.maxBeads}`
          : `${n} חרוזים`,
      status: inRange ? 'done' : under && n > 0 ? 'partial' : n > rules.maxBeads ? 'warn' : 'todo',
    });
  }

  // קטגוריות נדרשות
  if (rules.requiredCategories?.length) {
    for (const cat of rules.requiredCategories) {
      const label = CATEGORY_LABELS[cat as BeadCategory] ?? cat;
      const has = categories.has(cat);
      items.push({
        id: `cat-${cat}`,
        label: `סוג נדרש: ${label}`,
        detail: has ? 'יש על החוט' : 'עדיין חסר',
        status: has ? 'done' : 'todo',
      });
    }
  }

  // קטגוריות אסורות
  if (rules.forbiddenCategories?.length) {
    const bad = rules.forbiddenCategories.filter((c) => categories.has(c));
    const badLabels = bad.map((c) => CATEGORY_LABELS[c] ?? c).join(', ');
    items.push({
      id: 'forbidden',
      label: 'בלי חרוזים אסורים',
      detail:
        bad.length === 0
          ? n === 0
            ? 'עדיין לא הוספתם חרוזים'
            : 'נקי ✓'
          : `יש אסורים: ${badLabels}`,
      status: bad.length === 0 ? (n === 0 ? 'todo' : 'done') : 'warn',
    });
  }

  // מילה ברצף
  if (rules.letterWord) {
    const needed = rules.letterWord.split('');
    const sequential = containsSequence(letters, needed);
    const covered = countCovered(needed, letters);
    items.push({
      id: 'letter-word',
      label: `המילה «${rules.letterWord}» ברצף`,
      detail: sequential
        ? 'מופיעה על החוט ✓'
        : covered === 0
          ? 'עדיין אין אותיות מהמילה'
          : `אותיות: ${covered}/${needed.length} (לא ברצף מלא)`,
      status: sequential ? 'done' : covered > 0 ? 'partial' : 'todo',
    });
  } else if (rules.requiredLetters?.length) {
    const covered = countCovered(rules.requiredLetters, letters);
    const total = rules.requiredLetters.length;
    items.push({
      id: 'required-letters',
      label: `אותיות נדרשות (${rules.requiredLetters.join(' ')})`,
      detail: `${covered}/${total}`,
      status: covered === total ? 'done' : covered > 0 ? 'partial' : 'todo',
    });
  }

  // חרוזים ספציפיים
  if (rules.mustIncludeBeadIds?.length) {
    for (const id of rules.mustIncludeBeadIds) {
      const bead = getBead(id);
      const name = bead?.nameHe ?? id;
      const has = beadIds.has(id);
      items.push({
        id: `must-${id}`,
        label: `חובה: ${name}`,
        detail: has ? 'כלול ✓' : 'עדיין חסר',
        status: has ? 'done' : 'todo',
      });
    }
  }

  // אבנים יקרות
  if (rules.gemstoneCountMin != null) {
    const need = rules.gemstoneCountMin;
    items.push({
      id: 'gems',
      label: `אבנים יקרות: לפחות ${need}`,
      detail: `${gemCount}/${need}`,
      status: gemCount >= need ? 'done' : gemCount > 0 ? 'partial' : 'todo',
    });
  }

  return items;
}

export function checklistSummary(items: ChecklistItem[]): { done: number; total: number } {
  const total = items.length;
  const done = items.filter((i) => i.status === 'done').length;
  return { done, total };
}
