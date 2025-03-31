"use server";

import { getClient } from '@/lib/redis';

export async function DELETE() {
  const client = await getClient();

  try {
    let cursor = 0;
    let keys: string[] = [];

    do {
      const result = await client.scan(cursor, { MATCH: '*', COUNT: 100 });
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== 0);

    if (keys.length <= 0) {
      return new Response(JSON.stringify({ success: true, message: "No keys to delete" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      await client.del(keys);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Deleted ${keys.length} keys` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error deleting keys:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to delete keys" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
