'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { getUserId, getUserName, getUserPassword } from '@/config';
import { getClient } from '@/lib/redis';
import { createSession, deleteSession } from '@/lib/session';

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(1024)
});

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_SECONDS = 15 * 60;

export async function login(_prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors
    };
  }

  const { username, password } = result.data;
  const client = await getClient();
  const attemptKey = 'adh:login-attempts';
  const attempts = await client.incr(attemptKey);
  if (attempts === 1) await client.expire(attemptKey, ATTEMPT_WINDOW_SECONDS);

  const expectedPassword = await getUserPassword();
  const supplied = Buffer.from(password);
  const expected = Buffer.from(expectedPassword);
  const passwordMatches = supplied.length === expected.length && timingSafeEqual(supplied, expected);

  if (attempts > MAX_ATTEMPTS || username !== (await getUserName()) || !passwordMatches) {
    return {
      errors: {
        username: ['Invalid username or password']
      }
    };
  }

  await client.del(attemptKey);
  await createSession(await getUserId());

  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
