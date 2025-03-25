"use server";

import { createClient } from 'redis';
import { getRedisUrl } from '@/config';
import { NextResponse } from 'next/server';


export async function DELETE(request: Request) {
  const client = createClient({ url: await getRedisUrl() });

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID mancante nel corpo della richiesta" },
        { status: 400 }
      );
    }

    const deletedCount = await client.del(id);

    if (deletedCount === 1) {
      return NextResponse.json(
        { success: true, message: `Elemento con ID ${id} rimosso` },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: `Elemento con ID ${id} non trovato` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    return NextResponse.json(
      { error: "Errore del server durante l'operazione" },
      { status: 500 }
    );
  } finally {
    await client.disconnect();
  }
}
