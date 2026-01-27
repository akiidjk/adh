import { getStreamClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const streamClient = await getStreamClient();

  const url = new URL(req.url);
  const lastID = url.searchParams.get('lastID') || '$';

  const stream = new ReadableStream({
    async start(controller) {
      let currentID = lastID;
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: 'Connected!' })}\n\n`));
      try {
        while (!req.signal.aborted) {
          const results = await streamClient.xRead({ key: 'data_stream', id: currentID }, { COUNT: 1, BLOCK: 5000 });

          if (!results) continue;

          for (const { messages } of results) {
            for (const { id, message } of messages) {
              currentID = id;
              const values = Object.values(message);
              if (values.length >= 2) {
                const data = JSON.stringify({ [values[0]]: values[1] }).replace(/\n/g, '\\n');
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
        controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      }

      req.signal.addEventListener('abort', () => {
        controller.close();
      });
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
