import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreRequest, scoreMessage } from './scoring';
import type { PlacedBead } from './types';

function bead(id: string): PlacedBead {
  return { instanceId: id + '-i', beadId: id };
}

describe('scoreRequest', () => {
  it('gives high score for MAYA bracelet with charm', () => {
    const beads = [
      bead('pony-blush'),
      bead('ltr-pink-en-M'),
      bead('ltr-pink-en-A'),
      bead('ltr-pink-en-Y'),
      bead('ltr-pink-en-A'),
      bead('pony-blush'),
      bead('chm-heart-red'),
      bead('pony-blush'),
    ];
    const result = scoreRequest(beads, {
      minBeads: 8,
      maxBeads: 24,
      requiredLetters: ['M', 'A', 'Y', 'A'],
      letterWord: 'MAYA',
      requiredCategories: ['letter', 'charm'],
    });
    assert.ok(result.score >= 85, `expected >=85 got ${result.score}`);
  });

  it('penalizes forbidden categories', () => {
    const beads = [bead('pony-coral'), bead('gem-jade'), bead('wood-oak'), bead('pony-mint'), bead('gem-jade'), bead('wood-oak')];
    const result = scoreRequest(beads, {
      minBeads: 6,
      maxBeads: 22,
      requiredCategories: ['wood', 'gemstone'],
      forbiddenCategories: ['letter', 'pony'],
      gemstoneCountMin: 1,
    });
    assert.ok(result.score < 90);
    assert.ok(result.notes.some((n) => n.includes('אסורים')));
  });

  it('scoreMessage thresholds', () => {
    assert.match(scoreMessage(96), /מושלם/);
    assert.match(scoreMessage(10), /שוב/);
  });
});
