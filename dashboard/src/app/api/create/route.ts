'use server';

import { PageData, pageSchema } from '@/lib/models';
import { getClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
  const client = await getClient();
  const result = await client.HGETALL('page_data');
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const client = await getClient();
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { success: false, message: 'Endpoint query parameter is required' },
      { status: 400 }
    );
  }

  await client.hDel('page_data', endpoint);

  return NextResponse.json(
    { success: true, message: `Page data for endpoint '${endpoint}' deleted` },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const client = await getClient();
  const json = await request.json();
  const result = pageSchema.safeParse(json);

  if (!result.success) {
    const errors = result.error.flatten();
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: errors.fieldErrors,
      },
      { status: 400 }
    );
  }
  const validatedData: PageData = result.data;
  validatedData.endpoint = validatedData.endpoint.replace(/^\/+/, ''); // Remove leading slashes

  await client.hSet('page_data', validatedData.endpoint, validatedData.body || '');


  return new Response('Page data received', { status: 200 });
}
