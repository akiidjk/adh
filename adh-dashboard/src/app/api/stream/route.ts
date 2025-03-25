"use server";

import { getRedisUrl } from '@/config';
import { createClient } from 'redis';

export async function GET(req: Request) {
  const client = createClient({ url: await getRedisUrl() });
  await client.connect().catch(() => {
    return new Response("Redis connection failed", { status: 500 });
  });

  const stream = new ReadableStream({
    async start(controller) {
      let lastID = "$";
      const messageQueue: string[] = []; // Coda per i messaggi

      async function processQueue() {
        while (messageQueue.length > 0 && !req.signal.aborted) {
          const message = messageQueue.shift()!;
          controller.enqueue(message);
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      try {
        while (!req.signal.aborted) {
          const results = await client.xRead(
            { key: "data_stream", id: lastID },
            { COUNT: 1, BLOCK: 5000 }
          );

          if (!results) continue;

          for (const { messages } of results) {
            for (const { id, message } of messages) {
              lastID = id;
              const values = Object.values(message);

              if (values.length >= 2) {
                const data = JSON.stringify({ [values[0]]: values[1] })
                  .replace(/\n/g, "\\n");

                messageQueue.push(`data: ${data}\n\n`);
                await processQueue();
              }
            }
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
        controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      } finally {
        await client.quit().catch(() => { });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
