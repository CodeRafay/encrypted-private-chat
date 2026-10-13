// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { decrypt, encrypt, importKey, newKey } from '../crypto';

describe('crypto', () => {
  it('round-trips with the same key', async () => {
    const key = await importKey(newKey());
    const payload = { id: '1', text: 'héllo 👋', timestamp: 42 };
    expect(await decrypt(key, await encrypt(key, payload))).toEqual(payload);
  });

  it('returns null with the wrong key', async () => {
    const enc = await encrypt(await importKey(newKey()), { text: 'secret' });
    expect(await decrypt(await importKey(newKey()), enc)).toBeNull();
  });

  it('produces URL-safe keys and rejects malformed ones', async () => {
    expect(newKey()).toMatch(/^[A-Za-z0-9_-]{43}$/);
    await expect(importKey('short')).rejects.toThrow();
  });
});
