import { timingSafeEqual } from 'node:crypto';

// Constant-time string equality. The length comparison itself is not constant-time, but
// that only leaks the secret's length, not its contents.
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Per-client login-attempt key. Only trust X-Forwarded-For behind a trusted reverse proxy
// (TRUST_PROXY=true, the documented VPS setup); otherwise it is attacker-spoofable, so fall
// back to a single shared counter. This stops one attacker from locking out the operator.
export function lockoutKey(trustProxy: boolean, forwardedFor: string | null): string {
  if (trustProxy) {
    const ip = forwardedFor?.split(',')[0]?.trim();
    if (ip) return `adh:login-attempts:${ip}`;
  }
  return 'adh:login-attempts:global';
}
