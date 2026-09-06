import { EVENTS_KEY, getClient, getStreamClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const streamClient = await getStreamClient();
  const client = await getClient();
  const lastID = req.headers.get('last-event-id') || '$';

  const stream = new ReadableStream({
    async start(controller) {
      let currentID = lastID;
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('retry: 1000\n\n'));
      try {
        while (!req.signal.aborted) {
          const results = await streamClient.xRead({ key: EVENTS_KEY, id: currentID }, { COUNT: 10, BLOCK: 5000 });

          if (!results) {
            controller.enqueue(encoder.encode(': keep-alive\n\n'));
            continue;
          }

          for (const { messages } of results) {
            for (const { id, message } of messages) {
              currentID = id;
              const key = message.key;
              if (typeof key !== 'string') continue;
              const value = await client.json.get(key);
              if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
              controller.enqueue(
                encoder.encode(`id: ${id}\ndata: ${JSON.stringify({ key, ...(value as Record<string, unknown>) })}\n\n`)
              );
            }
          }
        }
      } catch (err) {
        if (!req.signal.aborted) console.error('Stream error:', err);
      } finally {
        streamClient.destroy();
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
