import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hashPassword,
  isSessionUnlocked,
  lockSession,
  profileHasCredentials,
  unlockSession,
  verifyPassword,
} from './profileAuth';

describe('profileAuth', () => {
  it('hashes and verifies passwords', async () => {
    const { salt, hash } = await hashPassword('secret1');
    assert.equal(await verifyPassword('secret1', salt, hash), true);
    assert.equal(await verifyPassword('wrong', salt, hash), false);
  });

  it('tracks local session unlock', () => {
    const mem: Record<string, string> = {};
    const store = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
    };
    unlockSession('Maya8', store);
    assert.equal(isSessionUnlocked('maya8', store), true);
    assert.equal(isSessionUnlocked('other', store), false);
    lockSession(store);
    assert.equal(isSessionUnlocked('maya8', store), false);
  });

  it('detects credential pair', () => {
    assert.equal(
      profileHasCredentials({
        username: 'a',
        passwordHash: 'x',
        passwordSalt: 'y',
      }),
      true,
    );
    assert.equal(
      profileHasCredentials({
        username: '',
        passwordHash: 'x',
        passwordSalt: 'y',
      }),
      false,
    );
  });
});
