import { getClient } from '@/lib/redis';

export async function GET() {
  try {
    await (await getClient()).ping();
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
