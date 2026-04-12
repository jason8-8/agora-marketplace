import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { AGENT_PROFILES } from '@/data/marketplace-config';

/** Parses any key format: ECDSA hex (0x...), raw 64-char hex, or DER */
function parseKey(key: string): PrivateKey {
  if (key.startsWith('0x') || (key.length === 64 && /^[0-9a-fA-F]+$/.test(key))) {
    return PrivateKey.fromStringECDSA(key);
  }
  return PrivateKey.fromStringDer(key);
}

export function getClient(): Client {
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(process.env.HEDERA_OPERATOR_ID!),
    parseKey(process.env.HEDERA_OPERATOR_KEY!)
  );
  return client;
}

export function getAgentClient(agentIndex: number): Client {
  const agent = AGENT_PROFILES[agentIndex];
  if (!agent) throw new Error(`No agent at index ${agentIndex}`);
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(agent.accountId),
    parseKey(agent.privateKey)
  );
  return client;
}

export function getAgentPrivateKey(agentIndex: number): PrivateKey {
  const agent = AGENT_PROFILES[agentIndex];
  if (!agent) throw new Error(`No agent at index ${agentIndex}`);
  return parseKey(agent.privateKey);
}
