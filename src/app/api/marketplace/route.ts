import { NextRequest } from 'next/server';
import { runDemoFlow } from '@/lib/demo-flow';
import type { CaseId } from '@/types/demo';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const caseId = (req.nextUrl.searchParams.get('case') ?? 'legal') as CaseId;
  const fast = req.nextUrl.searchParams.get('fast') === '1';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        const result = await runDemoFlow(caseId, (event) => {
          send({ type: 'PROGRESS', step: event.step, data: event.data ?? null });
        }, fast);
        send({ type: 'COMPLETE', result });
      } catch (err) {
        send({ type: 'ERROR', message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
