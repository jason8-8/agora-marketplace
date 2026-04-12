import Anthropic from '@anthropic-ai/sdk';
import { CACHED_NEGOTIATIONS } from '@/data/marketplace-config';
import type { MarketType, NegotiationType, CachedRound } from '@/types';

const MODEL = 'claude-haiku-4-5-20251001';

const hasApiKey = () => !!process.env.ANTHROPIC_API_KEY;

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

/** Check cache first — returns the cached round if available */
export function getCachedRound(
  market: MarketType,
  phase: NegotiationType,
  round: number
): CachedRound | null {
  const cached = CACHED_NEGOTIATIONS[market];
  if (!cached) return null;
  return (
    cached.rounds.find((r) => r.round === round && r.phase === phase) ?? null
  );
}

/** Score how well a seller matches a buyer's listing (0–10) */
export async function scoreInterest(
  market: MarketType,
  listing: string,
  sellerProfile: string
): Promise<{ score: number; reasoning: string; cached: boolean }> {
  // Try cache first
  const cached = getCachedRound(market, 'INTEREST', 0);
  if (cached?.fitScore !== undefined) {
    return { score: cached.fitScore, reasoning: 'Cached evaluation', cached: true };
  }

  // No API key — return safe default
  if (!hasApiKey()) {
    return { score: 8, reasoning: 'No API key — defaulting to good fit', cached: true };
  }

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 150,
    system:
      'You are an AI agent evaluating deal fit for a marketplace. Respond with JSON only: {"score": number, "reasoning": "one sentence"}. Score 0-10.',
    messages: [
      {
        role: 'user',
        content: `Buyer listing: ${listing}\n\nSeller profile: ${sellerProfile}\n\nHow well does this seller fit this buyer? Score 0-10.`,
      },
    ],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);
    return { score: parsed.score ?? 5, reasoning: parsed.reasoning ?? '', cached: false };
  } catch {
    return { score: 7, reasoning: 'Unable to parse response', cached: false };
  }
}

/** Generate a counter-offer message for a given round */
export async function generateCounterOffer(
  market: MarketType,
  round: number,
  side: 'buyer' | 'seller',
  context: string,
  currentPrice: number,
  targetPrice: number
): Promise<{ message: string; proposedPrice: number; cached: boolean }> {
  // Try cache first
  const cached = getCachedRound(market, 'COUNTER', round);
  if (cached) {
    const msg = side === 'buyer' ? cached.buyerMessage : cached.sellerMessage;
    if (msg) {
      return {
        message: msg,
        proposedPrice: cached.proposedPrice ?? currentPrice,
        cached: true,
      };
    }
  }

  // No API key — return fallback
  if (!hasApiKey()) {
    return {
      message: `We propose ${targetPrice} HBAR for this engagement.`,
      proposedPrice: targetPrice,
      cached: true,
    };
  }

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: `You are a ${side} agent in a ${market.toLowerCase()} marketplace negotiation. Keep responses under 30 words. Be professional and concise. Respond with JSON: {"message": "string", "proposedPrice": number}`,
    messages: [
      {
        role: 'user',
        content: `Context: ${context}\nCurrent offer: ${currentPrice} HBAR\nYour target: ${targetPrice} HBAR\nGenerate a negotiation response.`,
      },
    ],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text);
    return {
      message: parsed.message ?? 'Considering the offer...',
      proposedPrice: parsed.proposedPrice ?? currentPrice,
      cached: false,
    };
  } catch {
    return {
      message: `We propose ${targetPrice} HBAR for this engagement.`,
      proposedPrice: targetPrice,
      cached: false,
    };
  }
}
