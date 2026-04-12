/**
 * Agora Registry — HCS-backed expert & agent discovery
 *
 * Registry topic: 0.0.8605979 (AGORA_REGISTRY_TOPIC_ID)
 *
 * All registrations are published as HCS messages so any AI agent
 * built with @hashgraph/hedera-agent-kit can discover them using
 * the "Get Topic Messages" tool or the /api/agent/discover endpoint.
 *
 * External agent integration example:
 *   GET /api/agent/discover?type=EXPERT_REGISTRATION&domain=legal
 *   POST /api/agent/register  { accountId, name, framework, domains, description }
 */

import { publishMessage, readMessages } from './hcs';

export const REGISTRY_TOPIC_ID =
  process.env.AGORA_REGISTRY_TOPIC_ID ?? '0.0.8605979';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExpertRegistration {
  type: 'EXPERT_REGISTRATION';
  name: string;
  title: string;
  specialty: string;
  rate: number;
  years: number;
  domains: string[];
  bio: string;
  registeredAt: string;
}

export interface AgentRegistration {
  type: 'AGENT_REGISTRATION';
  accountId: string;    // Hedera account ID of the agent — its on-chain identity
  name: string;         // e.g. "LegalEagle v2"
  framework: string;    // LangChain, AutoGen, CrewAI, Agno, Custom…
  domains: string[];    // domains the agent operates in
  description: string;
  registeredAt: string;
}

export type RegistryEntry = (ExpertRegistration | AgentRegistration) & {
  hcsSeqNo: number;
};

// ── Write ─────────────────────────────────────────────────────────────────────

export async function publishExpertRegistration(
  data: Omit<ExpertRegistration, 'type' | 'registeredAt'>
): Promise<{ topicId: string; seqNo: number }> {
  const message: ExpertRegistration = {
    type: 'EXPERT_REGISTRATION',
    ...data,
    registeredAt: new Date().toISOString(),
  };
  const seqNo = await publishMessage(REGISTRY_TOPIC_ID, message);
  return { topicId: REGISTRY_TOPIC_ID, seqNo };
}

export async function publishAgentRegistration(
  data: Omit<AgentRegistration, 'type' | 'registeredAt'>
): Promise<{ topicId: string; seqNo: number }> {
  const message: AgentRegistration = {
    type: 'AGENT_REGISTRATION',
    ...data,
    registeredAt: new Date().toISOString(),
  };
  const seqNo = await publishMessage(REGISTRY_TOPIC_ID, message);
  return { topicId: REGISTRY_TOPIC_ID, seqNo };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function readRegistry(options?: {
  type?: 'EXPERT_REGISTRATION' | 'AGENT_REGISTRATION';
  domain?: string;
}): Promise<RegistryEntry[]> {
  const raw = await readMessages(REGISTRY_TOPIC_ID);

  const entries = raw.filter(
    (m): m is RegistryEntry =>
      typeof m === 'object' &&
      m !== null &&
      'type' in m &&
      (m.type === 'EXPERT_REGISTRATION' || m.type === 'AGENT_REGISTRATION')
  );

  return entries.filter((e) => {
    if (options?.type && e.type !== options.type) return false;
    if (options?.domain) {
      const domains = e.domains ?? [];
      return domains.some((d: string) =>
        d.toLowerCase().includes(options.domain!.toLowerCase())
      );
    }
    return true;
  });
}
