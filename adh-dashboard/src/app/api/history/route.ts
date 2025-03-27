"use server";

import { getClient } from '@/lib/redis';

export async function GET() {

  const client = await getClient();

  try {
    let cursor = 0;
    const keys = [];

    do {
      const reply = await client.scan(cursor, { MATCH: "*", COUNT: 100 });
      cursor = reply.cursor;
      keys.push(...reply.keys);
    } while (cursor !== 0);

    if (keys.length === 0) {
      return new Response(JSON.stringify({ request_number: 0, data: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const pipeline = client.multi();
    keys.forEach((key) => pipeline.type(key));
    const types = await pipeline.exec();

    const filteredKeys = keys.filter((_, index) => types[index] === "string");

    if (filteredKeys.length === 0) {
      return new Response(JSON.stringify({ request_number: 0, data: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const values = await client.mGet(filteredKeys);
    const result = filteredKeys.map((key, index) => ({ [key]: values[index] }));

    return new Response(JSON.stringify({ request_number: result.length, data: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Redis error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
