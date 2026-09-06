'use server';

import { REQUEST_INDEX, getClient } from '@/lib/redis';

export async function GET(request: Request) {
  const client = await getClient();
  const url = new URL(request.url);
  const limit = boundedInt(url.searchParams.get('limit'), 50, 1, 100);
  const offset = boundedInt(url.searchParams.get('offset'), 0, 0, 1_000_000);

  try {
    const results = await client.ft.search(REQUEST_INDEX, '*', {
      LIMIT: { from: offset, size: limit },
      SORTBY: { BY: 'timestamp', DIRECTION: 'DESC' },
      RETURN: ['$']
    });
    const data = results.documents.map((document) => ({
      key: document.id,
      ...Object.fromEntries(Object.entries(document.value))
    }));
    return jsonResponse(results.total, data);
  } catch (error) {
    console.error('Redis error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function jsonResponse(count: number, data: object) {
  return new Response(JSON.stringify({ request_number: count, data }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function boundedInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
