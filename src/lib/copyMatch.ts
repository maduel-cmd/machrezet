import type { PlacedBead } from './types';

export interface CopyMatchResult {
  exact: boolean;
  score: number;
  matchedPrefix: number;
  lengthDiff: number;
  notes: string[];
}

/** השוואת העתקה: זהות מלאה = 100, דמיון חלקי לפי LCS יחסית */
export function matchCopy(player: PlacedBead[], targetIds: string[]): CopyMatchResult {
  const playerIds = player.map((p) => p.beadId);
  const notes: string[] = [];

  if (playerIds.length === 0) {
    return { exact: false, score: 0, matchedPrefix: 0, lengthDiff: targetIds.length, notes: ['החוט ריק'] };
  }

  let prefix = 0;
  while (prefix < playerIds.length && prefix < targetIds.length && playerIds[prefix] === targetIds[prefix]) {
    prefix++;
  }

  const lcs = longestCommonSubsequence(playerIds, targetIds);
  const lengthPenalty =
    targetIds.length === 0
      ? 0
      : Math.abs(playerIds.length - targetIds.length) / Math.max(playerIds.length, targetIds.length);

  const similarity = lcs / Math.max(targetIds.length, 1);
  let score = Math.round(similarity * 100 * (1 - lengthPenalty * 0.35));
  score = Math.max(0, Math.min(100, score));

  const exact =
    playerIds.length === targetIds.length && playerIds.every((id, i) => id === targetIds[i]);

  if (exact) {
    notes.push('התאמה מושלמת ✓');
    score = 100;
  } else {
    if (prefix > 0) notes.push(`התחלה נכונה: ${prefix} חרוזים`);
    notes.push(`דמיון רצף: ${lcs}/${targetIds.length}`);
    if (playerIds.length !== targetIds.length) {
      notes.push(`אורך: שלכם ${playerIds.length}, יעד ${targetIds.length}`);
    }
  }

  return {
    exact,
    score,
    matchedPrefix: prefix,
    lengthDiff: Math.abs(playerIds.length - targetIds.length),
    notes,
  };
}

function longestCommonSubsequence(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j] ?? 0, dp[i]![j - 1] ?? 0);
      }
    }
  }
  return dp[m]![n] ?? 0;
}
