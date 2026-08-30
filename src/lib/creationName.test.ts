import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { defaultCreationName, isDefaultCreationName } from './creationName';

describe('defaultCreationName', () => {
  it('uses player name when set', () => {
    assert.equal(defaultCreationName('bracelet', 'נועה'), 'צמיד של נועה');
    assert.equal(defaultCreationName('necklace', '  מאיה  '), 'שרשרת של מאיה');
    assert.equal(defaultCreationName('ornament', 'דני'), 'קישוט של דני');
  });

  it('falls back without player name', () => {
    assert.equal(defaultCreationName('bracelet', ''), 'צמיד שלי');
    assert.equal(defaultCreationName('necklace', '   '), 'שרשרת שלי');
  });
});

describe('isDefaultCreationName', () => {
  it('treats empty and matching defaults as default', () => {
    assert.equal(isDefaultCreationName('', 'נועה'), true);
    assert.equal(isDefaultCreationName('צמיד של נועה', 'נועה'), true);
    assert.equal(isDefaultCreationName('שרשרת של נועה', 'נועה'), true);
  });

  it('detects custom names', () => {
    assert.equal(isDefaultCreationName('מתנה לאמא', 'נועה'), false);
    assert.equal(isDefaultCreationName('צמיד של נועה!', 'נועה'), false);
  });
});
