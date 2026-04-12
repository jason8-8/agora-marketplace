export const runtime = 'nodejs';

import { runAgoraFlow } from '@/lib/review-flow';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const result = await runAgoraFlow((event) => {
          send({ type: 'PROGRESS', ...event });
        });
        send({ type: 'COMPLETE', result });
      } catch (e: unknown) {
        send({ type: 'ERROR', message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
