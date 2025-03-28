"use server";

export async function getRedisUrl() {
  return process.env.REDIS_URL || 'redis://localhost:6379';
}

export async function getUserId() {
  return process.env.USER_ID || '0';
}

export async function getUserName() {
  return process.env.USER_NAME || 'akiidjk';
}

export async function getUserPassword() {
  return process.env.USER_PASSWORD || 'akiidjk';
}

export async function getSecretKey() {
  return process.env.SECRET_KEY || 'secret';
}
