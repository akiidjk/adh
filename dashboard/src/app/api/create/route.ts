'use server';

import { NextRequest, NextResponse } from 'next/server';

import { PageData, StoredPageData, pageSchema, storedPageSchema } from '@/lib/models';
import { PAGES_KEY, getClient } from '@/lib/redis';

export async function GET() {
  const client = await getClient();
  const result = await client.HGETALL(PAGES_KEY);

  const parsed: Record<string, StoredPageData> = {};
  for (const [endpoint, raw] of Object.entries(result)) {
    try {
      const value = storedPageSchema.safeParse(JSON.parse(raw));
      if (value.success) parsed[endpoint] = value.data;
    } catch {
      console.error(`Ignoring malformed page data for ${endpoint}`);
    }
  }

  return NextResponse.json(parsed);
}

export async function DELETE(request: NextRequest) {
  const client = await getClient();
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint || !pageSchema.shape.endpoint.safeParse(endpoint).success) {
    return NextResponse.json({ success: false, message: 'Endpoint query parameter is required' }, { status: 400 });
  }

  await client.hDel(PAGES_KEY, endpoint.replace(/^\/+/, ''));

  return NextResponse.json({ success: true, message: `Page data for endpoint '${endpoint}' deleted` }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return savePage(request, false);
}

export async function PUT(request: NextRequest) {
  return savePage(request, true);
}

async function savePage(request: NextRequest, update: boolean) {
  const client = await getClient();
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }
  const result = pageSchema.safeParse(json);

  if (!result.success) {
    const errors = result.error.flatten();
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed',
        errors: errors.fieldErrors
      },
      { status: 400 }
    );
  }

  const validatedData: PageData = result.data;
  validatedData.endpoint = validatedData.endpoint.replace(/^\/+/, '');

  const stored: StoredPageData = {
    body: validatedData.body,
    statusCode: validatedData.statusCode,
    headers: Object.fromEntries(validatedData.headers.filter((h) => h.key.trim() !== '').map((h) => [h.key, h.value]))
  };

  const transaction = client.multi();
  const originalEndpoint = validatedData.originalEndpoint?.replace(/^\/+/, '');
  if (update && originalEndpoint && originalEndpoint !== validatedData.endpoint) {
    transaction.hDel(PAGES_KEY, originalEndpoint);
  }
  transaction.hSet(PAGES_KEY, validatedData.endpoint, JSON.stringify(stored));
  await transaction.exec();

  return NextResponse.json({ success: true });
}
