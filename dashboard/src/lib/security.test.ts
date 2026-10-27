import { afterEach, describe, expect, mock, test } from 'bun:test';

import { getSecretKey } from '@/config';
import { lockoutKey, safeEqual } from '@/lib/lockout';
import { pageSchema } from '@/lib/models';

mock.module('server-only', () => ({}));

const originalSecret = process.env.SECRET_KEY;

afterEach(() => {
  process.env.SECRET_KEY = originalSecret;
});

describe('security boundaries', () => {
  test('rejects weak session secrets', async () => {
    process.env.SECRET_KEY = 'secret';
    expect(getSecretKey()).rejects.toThrow('at least 32 random characters');
  });

  test('rejects a token signed with another key', async () => {
    const { decrypt, encrypt } = await import('@/lib/session');
    process.env.SECRET_KEY = 'a'.repeat(32);
    const token = await encrypt({ userId: '0', expiresAt: new Date(Date.now() + 60_000) });
    process.env.SECRET_KEY = 'b'.repeat(32);
    expect(await decrypt(token)).toBeUndefined();
  });

  test('bounds custom page content and headers', () => {
    const base = { endpoint: 'nested/page', body: 'ok', statusCode: 200, headers: [] };
    expect(pageSchema.safeParse(base).success).toBe(true);
    expect(pageSchema.safeParse({ ...base, body: 'x'.repeat(1024 * 1024 + 1) }).success).toBe(false);
    expect(pageSchema.safeParse({ ...base, headers: [{ key: 'X-Test', value: 'bad\r\nvalue' }] }).success).toBe(false);
  });

  test('login lockout is per-IP only behind a trusted proxy', () => {
    // Trusted proxy: each client IP gets its own counter, so one attacker can't lock out the operator.
    expect(lockoutKey(true, '203.0.113.1, 10.0.0.1')).toBe('adh:login-attempts:203.0.113.1');
    expect(lockoutKey(true, '198.51.100.7')).toBe('adh:login-attempts:198.51.100.7');
    // Untrusted: the header is spoofable, so fall back to a single shared counter.
    expect(lockoutKey(false, '203.0.113.1')).toBe('adh:login-attempts:global');
    expect(lockoutKey(true, null)).toBe('adh:login-attempts:global');
  });

  test('credential comparison is constant-time and correct', () => {
    expect(safeEqual('hunter2', 'hunter2')).toBe(true);
    expect(safeEqual('hunter2', 'hunter3')).toBe(false);
    expect(safeEqual('short', 'longer-value')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});
