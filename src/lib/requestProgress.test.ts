import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildRequestChecklist, checklistSummary } from './requestProgress';
import type { PlacedBead, RequestRules } from './types';

function bead(beadId: string, instanceId = beadId): PlacedBead {
  return { beadId, instanceId };
}

describe('buildRequestChecklist', () => {
  const mayaRules: RequestRules = {
    minBeads: 8,
    maxBeads: 24,
    requiredLetters: ['M', 'A', 'Y', 'A'],
    letterWord: 'MAYA',
    requiredCategories: ['letter', 'charm'],
  };

  it('starts empty with todo items', () => {
    const items = buildRequestChecklist([], mayaRules);
    const { done, total } = checklistSummary(items);
    assert.equal(done, 0);
    assert.ok(total >= 3);
    assert.ok(items.some((i) => i.id === 'length' && i.status === 'todo'));
    assert.ok(items.some((i) => i.id === 'letter-word' && i.status === 'todo'));
  });

  it('marks categories and word when MAYA + charm present', () => {
    const beads = [
      bead('ltr-white-en-M', '1'),
      bead('ltr-white-en-A', '2'),
      bead('ltr-white-en-Y', '3'),
      bead('ltr-white-en-A', '4'),
      bead('chm-heart-red', '5'),
      bead('pony-blush', '6'),
      bead('pony-blush', '7'),
      bead('pony-mint', '8'),
    ];
    const items = buildRequestChecklist(beads, mayaRules);
    assert.equal(items.find((i) => i.id === 'length')?.status, 'done');
    assert.equal(items.find((i) => i.id === 'cat-letter')?.status, 'done');
    assert.equal(items.find((i) => i.id === 'cat-charm')?.status, 'done');
    assert.equal(items.find((i) => i.id === 'letter-word')?.status, 'done');
  });

  it('warns on forbidden categories without changing scoring module', () => {
    const rules: RequestRules = {
      minBeads: 3,
      maxBeads: 10,
      forbiddenCategories: ['pony'],
      requiredCategories: ['pearl'],
    };
    const items = buildRequestChecklist(
      [bead('pearl-cream', 'a'), bead('pony-coral', 'b'), bead('pearl-cream', 'c')],
      rules,
    );
    assert.equal(items.find((i) => i.id === 'forbidden')?.status, 'warn');
  });

  it('tracks partial gem count', () => {
    const rules: RequestRules = {
      minBeads: 3,
      maxBeads: 12,
      gemstoneCountMin: 3,
    };
    const items = buildRequestChecklist(
      [bead('gem-jade', '1'), bead('gem-turquoise', '2'), bead('pony-mint', '3')],
      rules,
    );
    const gems = items.find((i) => i.id === 'gems');
    assert.equal(gems?.status, 'partial');
    assert.match(gems?.detail ?? '', /2\/3/);
  });
});
