import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchCopy } from './copyMatch';
import type { PlacedBead } from './types';

function strand(ids: string[]): PlacedBead[] {
  return ids.map((beadId, i) => ({ instanceId: `${i}`, beadId }));
}

describe('matchCopy', () => {
  it('exact match scores 100', () => {
    const ids = ['a', 'b', 'c'];
    const r = matchCopy(strand(ids), ids);
    assert.equal(r.exact, true);
    assert.equal(r.score, 100);
  });

  it('empty strand scores 0', () => {
    const r = matchCopy([], ['a', 'b']);
    assert.equal(r.score, 0);
  });

  it('partial similarity is between 0 and 100', () => {
    const r = matchCopy(strand(['a', 'b', 'x']), ['a', 'b', 'c']);
    assert.ok(r.score > 0 && r.score < 100);
    assert.equal(r.matchedPrefix, 2);
  });
});
