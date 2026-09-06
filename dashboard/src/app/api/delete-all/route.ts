'use server';

import { EVENTS_KEY, REQUEST_PREFIX, getClient } from '@/lib/redis';

export async function DELETE() {
  const client = await getClient();

  try {
    let cursor = '0';
    let deleted = 0;

    do {
      const result = await client.scan(cursor, { MATCH: `${REQUEST_PREFIX}*`, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        deleted += await client.unlink(result.keys);
      }
    } while (cursor !== '0');

    await client.del(EVENTS_KEY);

    return new Response(JSON.stringify({ success: true, message: `Deleted ${deleted} keys` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error deleting keys:', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to delete keys' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
