import { NextRequest } from 'next/server';
import { readRegistry, REGISTRY_TOPIC_ID } from '@/lib/agora-registry';

export const runtime = 'nodejs';

/**
 * GET /api/agent/discover
 *
 * Returns experts and agents registered on the Agora HCS registry.
 * External AI agents can call this to find human experts to hire.
 *
 * Query params:
 *   ?type=EXPERT_REGISTRATION|AGENT_REGISTRATION  (filter by type)
 *   ?domain=legal|finance|medical                  (filter by domain keyword)
 *
 * Returns: { registryTopicId, hashscan, entries[] }
 */
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') as
    | 'EXPERT_REGISTRATION'
    | 'AGENT_REGISTRATION'
    | null;
  const domain = req.nextUrl.searchParams.get('domain') ?? undefined;

  try {
    const entries = await readRegistry({
      type: type ?? undefined,
      domain,
    });

    return Response.json({
      registryTopicId: REGISTRY_TOPIC_ID,
      hashscan: `https://hashscan.io/testnet/topic/${REGISTRY_TOPIC_ID}`,
      count: entries.length,
      entries,
    });
  } catch (err) {
    console.error('Registry read failed:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
