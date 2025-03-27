"use server";

import { getClient } from '@/lib/redis';

export async function DELETE(request: Request) {
  const client = await getClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ error: "ID missing in the request URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const deletedCount = await client.del(id);

  if (deletedCount === 1) {
    return new Response(
      JSON.stringify({ success: true, message: `Element with ID ${id} removed` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } else {
    return new Response(
      JSON.stringify({ success: false, error: `Element with ID ${id} not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}
