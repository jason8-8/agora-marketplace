import { AGENT_PROFILES } from '@/data/marketplace-config';
import type { AgentProfile, MarketType } from '@/types';

export const ALL_AGENTS: AgentProfile[] = AGENT_PROFILES;

export function getAgentsByMarket(market: MarketType): {
  buyer: AgentProfile;
  seller: AgentProfile;
  buyerIndex: number;
  sellerIndex: number;
} {
  const buyerIndex = AGENT_PROFILES.findIndex(
    (a) => a.market === market && a.role === 'buyer'
  );
  const sellerIndex = AGENT_PROFILES.findIndex(
    (a) => a.market === market && a.role === 'seller'
  );
  if (buyerIndex === -1 || sellerIndex === -1) {
    throw new Error(`Could not find buyer/seller pair for market: ${market}`);
  }
  return {
    buyer: AGENT_PROFILES[buyerIndex],
    seller: AGENT_PROFILES[sellerIndex],
    buyerIndex,
    sellerIndex,
  };
}

export function getAgentById(id: string): AgentProfile | undefined {
  return AGENT_PROFILES.find((a) => a.id === id);
}
