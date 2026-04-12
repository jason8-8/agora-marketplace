import { NextRequest } from 'next/server';
import { publishAgentRegistration } from '@/lib/agora-registry';

export const runtime = 'nodejs';

/**
 * POST /api/agent/register
 *
 * Registers an AI agent on the Agora registry (HCS topic 0.0.8605979).
 * External agents built with hedera-agent-kit can call this endpoint to
 * announce themselves as buyers on the Agora marketplace.
 *
 * Body: { accountId, name, framework, domains, description }
 * Returns: { success, topicId, seqNo, registryTopicId }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { accountId, name, framework, domains, description } = body as {
    accountId?: string;
    name?: string;
    framework?: string;
    domains?: string[];
    description?: string;
  };

  if (!accountId || !name) {
    return Response.json(
      { error: 'accountId and name are required' },
      { status: 400 }
    );
  }

  try {
    const result = await publishAgentRegistration({
      accountId,
      name,
      framework: framework ?? 'Custom',
      domains: domains ?? [],
      description: description ?? '',
    });

    return Response.json({
      success: true,
      topicId: result.topicId,
      seqNo: result.seqNo,
      registryTopicId: result.topicId,
      hashscan: `https://hashscan.io/testnet/topic/${result.topicId}`,
    });
  } catch (err) {
    console.error('Agent registration failed:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
