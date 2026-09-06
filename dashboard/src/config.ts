'use server';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function getRedisAddress() {
  return process.env.REDIS_ADDR || 'localhost';
}

export async function getRedisPort() {
  const port = Number(process.env.REDIS_PORT || '6379');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('REDIS_PORT must be a valid port');
  return port;
}

export async function getRedisPassword() {
  const password = requiredEnv('REDIS_PASSWORD');
  if (password === 'redis_password') throw new Error('REDIS_PASSWORD must be changed');
  return password;
}

export async function getUserId() {
  return process.env.USER_ID || '0';
}

export async function getUserName() {
  const name = requiredEnv('USER_NAME');
  if (name === 'username') throw new Error('USER_NAME must be changed');
  return name;
}

export async function getUserPassword() {
  const password = requiredEnv('USER_PASSWORD');
  if (password === 'your_password_here') throw new Error('USER_PASSWORD must be changed');
  return password;
}

export async function getSecretKey() {
  const key = requiredEnv('SECRET_KEY');
  if (key.length < 32 || key.startsWith('replace_')) {
    throw new Error('SECRET_KEY must be replaced with at least 32 random characters');
  }
  return key;
}

export async function validateConfig() {
  await Promise.all([getRedisPassword(), getUserName(), getUserPassword(), getSecretKey()]);
}
