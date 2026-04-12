export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createTopic } from '@/lib/hcs';
import { runNegotiation, forceComplete } from '@/lib/negotiation-engine';
import type { MarketType, NegotiationState } from '@/types';

// ── GET: SSE stream for a market negotiation ─────────────────────────────────
export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get('market') as MarketType;

  if (!market || !['SPEAKERS', 'TALENT', 'SPONSORS'].includes(market)) {
    return NextResponse.json({ error: 'Invalid market' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      try {
        // Create a fresh HCS topic for this negotiation
        const topicId = await createTopic(`${market}-negotiation-${Date.now()}`);
        send({ type: 'TOPIC_CREATED', topicId, market });

        // Run the full negotiation, streaming progress events
        const deal = await runNegotiation(
          market,
          topicId,
          (state: Partial<NegotiationState> & { market: MarketType }) => {
            send({ type: 'PROGRESS', market, state });
          }
        );

        send({ type: 'COMPLETE', market, deal });
      } catch (error) {
        console.error(`Negotiation error for ${market}:`, error);
        send({ type: 'ERROR', market, message: String(error) });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
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

// ── POST: Force-complete a stalled negotiation ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { market, topicId } = (await request.json()) as {
      market: MarketType;
      topicId: string;
    };

    if (!market || !['SPEAKERS', 'TALENT', 'SPONSORS'].includes(market)) {
      return NextResponse.json({ error: 'Invalid market' }, { status: 400 });
    }

    const deal = await forceComplete(market, topicId ?? `force-${Date.now()}`);
    return NextResponse.json({ deal });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
