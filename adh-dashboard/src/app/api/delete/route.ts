"use server";

import { createClient } from 'redis';
import { getRedisUrl } from '@/config';
import { NextResponse } from 'next/server';


export async function DELETE(request: Request) {
  const client = createClient({ url: await getRedisUrl() });

  try {
    await client.connect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID missing in the request body" },
        { status: 400 }
      );
    }

    const deletedCount = await client.del(id);

    if (deletedCount === 1) {
      return NextResponse.json(
        { success: true, message: `Element with ID ${id} removed` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: `Element with ID ${id} not found` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Error during deletion:", error);
    return NextResponse.json(
      { error: "Error during deletion" },
      { status: 500 }
    );
  } finally {
    await client.disconnect();
  }
}
