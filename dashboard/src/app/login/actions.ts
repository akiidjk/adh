'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getUserId, getUserName, getUserPassword } from '@/config';
import { lockoutKey, safeEqual } from '@/lib/lockout';
import { getClient } from '@/lib/redis';
import { createSession, deleteSession } from '@/lib/session';

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(1024)
});

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_SECONDS = 15 * 60;

async function attemptKey(): Promise<string> {
  const forwardedFor = process.env.TRUST_PROXY === 'true' ? (await headers()).get('x-forwarded-for') : null;
  return lockoutKey(process.env.TRUST_PROXY === 'true', forwardedFor);
}

export async function login(_prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors
    };
  }

  const { username, password } = result.data;
  const client = await getClient();
  const key = await attemptKey();
  const attempts = await client.incr(key);
  if (attempts === 1) await client.expire(key, ATTEMPT_WINDOW_SECONDS);

  const usernameMatches = safeEqual(username, await getUserName());
  const passwordMatches = safeEqual(password, await getUserPassword());

  if (attempts > MAX_ATTEMPTS || !usernameMatches || !passwordMatches) {
    return {
      errors: {
        username: ['Invalid username or password']
      }
    };
  }

  await client.del(key);
  await createSession(await getUserId());

  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
