import { getBead } from '../data/beads';
import type { PlacedBead, RequestRules } from './types';

export interface ScoreBreakdown {
  score: number;
  maxScore: number;
  notes: string[];
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

/** ניקוד יצירה לפי בקשת האתגר (0–100) */
export function scoreRequest(beads: PlacedBead[], rules: RequestRules): ScoreBreakdown {
  const notes: string[] = [];
  let points = 0;
  let max = 0;

  const defs = beads.map((b) => getBead(b.beadId)).filter(Boolean);
  const categories = new Set(defs.map((d) => d!.category));
  const beadIds = new Set(beads.map((b) => b.beadId));
  const letters = lettersOnStrand(beads);
  const gemCount = defs.filter((d) => d!.category === 'gemstone').length;

  // אורך
  max += 20;
  if (beads.length >= rules.minBeads && beads.length <= rules.maxBeads) {
    points += 20;
    notes.push('אורך מתאים ✓');
  } else if (beads.length < rules.minBeads) {
    notes.push(`קצר מדי (מינימום ${rules.minBeads})`);
    points += Math.max(0, Math.round(20 * (beads.length / rules.minBeads)));
  } else {
    notes.push(`ארוך מדי (מקסימום ${rules.maxBeads})`);
    points += 8;
  }

  // קטגוריות נדרשות
  if (rules.requiredCategories?.length) {
    const weight = 25;
    max += weight;
    const hit = rules.requiredCategories.filter((c) => categories.has(c)).length;
    const ratio = hit / rules.requiredCategories.length;
    points += Math.round(weight * ratio);
    if (ratio === 1) notes.push('כל סוגי החרוזים הנדרשים ✓');
    else notes.push(`חסרים סוגים: ${rules.requiredCategories.filter((c) => !categories.has(c)).join(', ')}`);
  }

  // קטגוריות אסורות
  if (rules.forbiddenCategories?.length) {
    const weight = 15;
    max += weight;
    const bad = rules.forbiddenCategories.filter((c) => categories.has(c));
    if (bad.length === 0) {
      points += weight;
      notes.push('ללא חרוזים אסורים ✓');
    } else {
      notes.push(`יש חרוזים אסורים (${bad.join(', ')})`);
    }
  }

  // אותיות / מילה
  if (rules.letterWord) {
    const weight = 25;
    max += weight;
    const needed = rules.letterWord.split('');
    if (containsSequence(letters, needed)) {
      points += weight;
      notes.push(`המילה "${rules.letterWord}" מופיעה ✓`);
    } else {
      // ניקוד חלקי לפי כיסוי אותיות
      const neededSet = [...needed];
      let covered = 0;
      const available = [...letters];
      for (const ch of neededSet) {
        const idx = available.indexOf(ch);
        if (idx >= 0) {
          covered++;
          available.splice(idx, 1);
        }
      }
      points += Math.round(weight * (covered / needed.length) * 0.6);
      notes.push(`המילה "${rules.letterWord}" לא ברצף מלא`);
    }
  } else if (rules.requiredLetters?.length) {
    const weight = 20;
    max += weight;
    const available = [...letters];
    let covered = 0;
    for (const ch of rules.requiredLetters) {
      const idx = available.indexOf(ch);
      if (idx >= 0) {
        covered++;
        available.splice(idx, 1);
      }
    }
    const ratio = covered / rules.requiredLetters.length;
    points += Math.round(weight * ratio);
    if (ratio === 1) notes.push('כל האותיות הנדרשות ✓');
    else notes.push(`אותיות: ${covered}/${rules.requiredLetters.length}`);
  }

  // חרוזים ספציפיים
  if (rules.mustIncludeBeadIds?.length) {
    const weight = 15;
    max += weight;
    const hit = rules.mustIncludeBeadIds.filter((id) => beadIds.has(id)).length;
    const ratio = hit / rules.mustIncludeBeadIds.length;
    points += Math.round(weight * ratio);
    if (ratio === 1) notes.push('חרוזים חובה כלולים ✓');
    else notes.push(`חרוזי חובה: ${hit}/${rules.mustIncludeBeadIds.length}`);
  }

  // אבנים יקרות
  if (rules.gemstoneCountMin != null) {
    const weight = 15;
    max += weight;
    if (gemCount >= rules.gemstoneCountMin) {
      points += weight;
      notes.push(`אבנים יקרות: ${gemCount} ✓`);
    } else {
      points += Math.round(weight * (gemCount / rules.gemstoneCountMin));
      notes.push(`אבנים יקרות: ${gemCount}/${rules.gemstoneCountMin}`);
    }
  }

  // בונוס אסתטי קל — מגוון
  max += 5;
  if (categories.size >= 3) {
    points += 5;
    notes.push('מגוון יפה של סוגי חרוזים ✓');
  } else if (categories.size >= 2) {
    points += 3;
  }

  const score = max === 0 ? 0 : Math.min(100, Math.round((points / max) * 100));
  return { score, maxScore: 100, notes };
}

export function scoreMessage(score: number): string {
  if (score >= 95) return 'מושלם! יצירת מופת של חרוזים.';
  if (score >= 85) return 'מעולה — כמעט בדיוק מה שביקשו!';
  if (score >= 70) return 'יפה מאוד, עם כמה נקודות לשיפור.';
  if (score >= 50) return 'כיוון טוב — נסו להתקרב יותר לבקשה.';
  if (score >= 30) return 'יש התחלה, אבל חסרים אלמנטים חשובים.';
  return 'נסו שוב לפי תיאור האתגר.';
}
