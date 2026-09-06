import { RedisClientType, createClient } from 'redis';

import { getRedisAddress, getRedisPassword, getRedisPort } from '@/config';

const REQUEST_INDEX = 'idx:adh:requests';
const REQUEST_PREFIX = 'adh:request:';
const PAGES_KEY = 'adh:pages';
const EVENTS_KEY = 'adh:events';

let clientPromise: Promise<RedisClientType> | null = null;

const createRedisClient = async (): Promise<RedisClientType> => {
  const client = createClient({
    socket: { host: await getRedisAddress(), port: await getRedisPort() },
    password: await getRedisPassword()
  });

  client.on('error', (err) => console.error('Redis Client Error', err));

  await client.connect();
  return client as unknown as RedisClientType;
};

const getStreamClient = async (): Promise<RedisClientType> => {
  const client = (await getClient()).duplicate();
  client.on('error', (err) => console.error('Redis Stream Client Error', err));
  await client.connect();
  return client as unknown as RedisClientType;
};

const getClient = async (): Promise<RedisClientType> => {
  clientPromise ??= createRedisClient().catch((error) => {
    clientPromise = null;
    throw error;
  });
  return clientPromise;
};

export { EVENTS_KEY, PAGES_KEY, REQUEST_INDEX, REQUEST_PREFIX, getStreamClient, getClient };
