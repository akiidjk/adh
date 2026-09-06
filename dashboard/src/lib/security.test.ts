import { afterEach, describe, expect, mock, test } from 'bun:test';

import { getSecretKey } from '@/config';
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
});
