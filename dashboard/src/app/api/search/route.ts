import { getClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '*';
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const client = await getClient();

    const results = await client.ft.search('idx:complete_requests', `${query}`, {
      LIMIT: { from: offset, size: limit },
      RETURN: ['$'] // Restituisce tutto il documento JSON
    });

    const keys = results.documents.map((doc) => doc.id);
    const values = results.documents.map((doc) => Object.fromEntries(Object.entries(doc.value)));
    const formattedResults = formatValues(keys, values);
    const parsedData = formattedResults.map((entry: Record<string, object>) => {
      const key = parseInt(Object.keys(entry)[0]);
      return { key, ...entry[key] };
    });
    return NextResponse.json({
      success: true,
      total: results.total,
      results: parsedData
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error || 'Unknown error' }, { status: 500 });
  }
}

function formatValues(keys: string[], values: object[]): { [x: string]: object }[] {
  const formattedValues = [];
  for (const [index, value] of values.entries()) {
    const formattedKey = keys[index];
    formattedValues.push({ [formattedKey]: value });
  }
  return formattedValues;
}
