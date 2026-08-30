import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  FOREVER_EXPIRES_AT,
  addCreation,
  daysLeft,
  deleteCreation,
  isPermanentCreation,
  loadCreations,
  loadProfile,
  normalizeCreation,
  normalizeProfile,
  normalizeUsername,
  pruneExpired,
  profileIsSet,
  retentionLabel,
  saveCreations,
  saveProfile,
} from './storage';
import type { Creation } from './types';

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

const base = {
  name: 'בדיקה',
  kind: 'bracelet' as const,
  beads: [],
  cordColor: '#fff',
  source: 'free' as const,
};

describe('storage', () => {
  it('saves and loads creations forever', () => {
    const store = memoryStorage();
    const now = 1_000_000;
    addCreation(base, store, now);
    const loaded = loadCreations(store, now);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]!.expiresAt, FOREVER_EXPIRES_AT);
    assert.equal(loaded[0]!.permanent, true);
  });

  it('migrates old 14-day creations to forever on load', () => {
    const now = 1_000_000;
    const oldTimed: Creation = {
      ...base,
      id: 'old',
      createdAt: now - 1,
      expiresAt: now + 1000,
      permanent: false,
    };
    const store = memoryStorage({
      'machrezet-creations-v1': JSON.stringify([oldTimed]),
    });
    const loaded = loadCreations(store, now);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]!.permanent, true);
    assert.equal(loaded[0]!.expiresAt, FOREVER_EXPIRES_AT);
    const raw = JSON.parse(store.getItem('machrezet-creations-v1')!) as Creation[];
    assert.equal(raw[0]!.permanent, true);
  });

  it('does not drop creations after long time', () => {
    const now = 1_000_000;
    const old: Creation = {
      ...base,
      id: 'keep',
      createdAt: 1,
      expiresAt: now - 1,
      permanent: false,
    };
    assert.equal(pruneExpired([old], now + 999_999_999).length, 1);
    assert.equal(normalizeCreation(old).permanent, true);
  });

  it('deleteCreation removes item', () => {
    const store = memoryStorage();
    const now = 5_000;
    const c = addCreation(base, store, now);
    const left = deleteCreation(c.id, store, now);
    assert.equal(left.length, 0);
  });

  it('daysLeft and retention are forever', () => {
    assert.equal(daysLeft(0, 0), Number.POSITIVE_INFINITY);
    assert.equal(retentionLabel(), 'נשמר לנצח במכשיר');
    assert.equal(isPermanentCreation(), true);
  });

  it('saveCreations writes forever list', () => {
    const store = memoryStorage();
    const now = 10;
    saveCreations(
      [
        { ...base, id: 'x', createdAt: 0, expiresAt: 5 },
        { ...base, id: 'y', createdAt: 0, expiresAt: 100 },
      ],
      store,
      now,
    );
    const loaded = loadCreations(store, now);
    assert.equal(loaded.length, 2);
    assert.ok(loaded.every((c) => c.permanent && c.expiresAt === FOREVER_EXPIRES_AT));
  });

  it('saves and loads player profile locally', () => {
    const store = memoryStorage();
    const now = 42;
    const saved = saveProfile(
      {
        displayName: '  מאיה  ',
        username: 'maya8',
        age: 8,
        photoDataUrl: 'data:image/jpeg;base64,abc',
        passwordSalt: 'aabbccddeeff0011',
        passwordHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        updatedAt: 1,
      },
      store,
      now,
    );
    assert.equal(saved.displayName, 'מאיה');
    assert.equal(saved.username, 'maya8');
    assert.equal(saved.age, 8);
    assert.equal(saved.updatedAt, now);
    assert.ok(saved.passwordHash);
    const loaded = loadProfile(store, now);
    assert.equal(loaded.displayName, 'מאיה');
    assert.equal(loaded.username, 'maya8');
    assert.equal(loaded.age, 8);
    assert.equal(loaded.photoDataUrl, 'data:image/jpeg;base64,abc');
    assert.equal(profileIsSet(loaded), true);
  });

  it('rejects invalid age and non-image photo data', () => {
    const p = normalizeProfile(
      { displayName: 'דני', age: 2, photoDataUrl: 'http://evil.example/x.png', updatedAt: 1 },
      9,
    );
    assert.equal(p.age, null);
    assert.equal(p.photoDataUrl, null);
    assert.equal(p.username, '');
    assert.equal(p.passwordHash, null);
    assert.equal(profileIsSet(p), true);
  });

  it('keeps username without password but drops orphan password hashes', () => {
    const withUser = normalizeProfile({ username: 'dani', displayName: 'דני', updatedAt: 1 }, 1);
    assert.equal(withUser.username, 'dani');
    assert.equal(withUser.passwordHash, null);

    const orphan = normalizeProfile(
      {
        username: '',
        passwordSalt: 'aabbccddeeff0011',
        passwordHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        updatedAt: 1,
      },
      1,
    );
    assert.equal(orphan.passwordHash, null);
    assert.equal(orphan.passwordSalt, null);
  });

  it('accepts email usernames', () => {
    const email = 'mikamaduel@gmail.com';
    assert.equal(normalizeUsername(email), email);
    const p = normalizeProfile(
      {
        displayName: 'מיקה',
        username: email,
        passwordSalt: 'aabbccddeeff0011',
        passwordHash: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        updatedAt: 1,
      },
      1,
    );
    assert.equal(p.username, email);
    assert.ok(p.passwordHash);
  });
});
