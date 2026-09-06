import { NextResponse } from 'next/server';

import { REQUEST_INDEX, getClient } from '@/lib/redis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '*').slice(0, 500);
  const limit = boundedInt(searchParams.get('limit'), 10, 1, 100);
  const offset = boundedInt(searchParams.get('offset'), 0, 0, 1_000_000);

  try {
    const client = await getClient();

    const results = await client.ft.search(REQUEST_INDEX, query, {
      LIMIT: { from: offset, size: limit },
      RETURN: ['$'] // Restituisce tutto il documento JSON
    });

    const parsedData = results.documents.map((document) => ({
      key: document.id,
      ...Object.fromEntries(Object.entries(document.value))
    }));
    return NextResponse.json({
      success: true,
      total: results.total,
      results: parsedData
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid search query' }, { status: 400 });
  }
}

function boundedInt(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
