import { getRedisUrl } from "@/config";
import { createClient, RedisClientType } from "redis";

let streamClient: RedisClientType | null = null;
const clientPool: RedisClientType[] = [];
const MAX_CLIENTS = 5;

const createRedisClient = async (): Promise<RedisClientType> => {
  const url = await getRedisUrl();
  const client = createClient({ url });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect();
  return client as unknown as RedisClientType;
};

const getStreamClient = async (): Promise<RedisClientType> => {
  if (!streamClient) {
    streamClient = await createRedisClient();
  }
  return streamClient;
};

const getClientPool = async (): Promise<RedisClientType[]> => {
  if (clientPool.length === 0) {
    for (let i = 0; i < MAX_CLIENTS; i++) {
      const client = await createRedisClient();
      clientPool.push(client);
    }
  }
  return clientPool;
};

const getClient = async (): Promise<RedisClientType> => {
  const pool = await getClientPool();
  return pool[Math.floor(Math.random() * pool.length)];
};

export { getStreamClient, getClient };
