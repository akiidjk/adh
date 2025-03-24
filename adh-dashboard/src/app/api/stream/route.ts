import { createClient } from 'redis';

export async function GET(req) {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const stream = new ReadableStream({
    async start(controller) {
      let lastID = "$"; // "$" = solo nuovi messaggi

      try {
        while (!req.signal.aborted) {
          const results = await client.xRead(
            { key: "data_stream", id: lastID },
            { COUNT: 1, BLOCK: 5000 }
          );

          if (!results || results.length === 0) continue;

          for (const { messages } of results) {
            for (const { id, message } of messages) {
              lastID = id;
              const values = Object.values(message);

              if (values.length >= 2) {
                const obj: Record<string, string> = {};
                obj[values[0] as string] = values[1] as string;
                controller.enqueue('data: ' + JSON.stringify(obj) + '\n\n');
              }
            }
          }
        }
      } catch (err) {
        console.error("Redis stream error:", err);
      } finally {
        await client.disconnect();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
