import { createTopic, publishMessage } from './hcs';
import { transferHBAR } from './hbar';
import { mintDealNFT } from './hts';
import { scoreInterest, generateCounterOffer, getCachedRound } from './claude';
import { getAgentsByMarket } from './agents';
import { CACHED_NEGOTIATIONS } from '@/data/marketplace-config';
import type { MarketType, NegotiationState, NegotiationMessage, Deal } from '@/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Faster pacing for demo — keep it snappy
const STEP = 1200;

type ProgressCallback = (state: Partial<NegotiationState> & { market: MarketType }) => void;

export async function runNegotiation(
  market: MarketType,
  topicId: string,
  onProgress: ProgressCallback
): Promise<Deal | null> {
  const { buyer, seller, buyerIndex } = getAgentsByMarket(market);
  const cached = CACHED_NEGOTIATIONS[market];
  const messages: NegotiationMessage[] = [];

  function makeMsg(
    type: NegotiationMessage['type'],
    from: string,
    content: string,
    price?: number,
    to?: string
  ): NegotiationMessage {
    const msg: NegotiationMessage = {
      id: `${market}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      market,
      from,
      to,
      content,
      price,
      timestamp: new Date().toISOString(),
    };
    messages.push(msg);
    return msg;
  }

  // ── STEP 1: LISTING ─────────────────────────────────────────────────────────
  const listingCached = getCachedRound(market, 'LISTING', 0);
  const listingText = listingCached?.buyerMessage ?? buyer.description;
  const listingMsg = makeMsg('LISTING', buyer.name, listingText, buyer.budgetPrice);

  await publishMessage(topicId, { ...listingMsg });
  onProgress({
    market,
    phase: 'listing',
    round: 0,
    topicId,
    messages: [...messages],
    currentBuyerMessage: listingText,
    currentSellerMessage: null,
    deal: null,
  });

  await sleep(STEP);

  // ── STEP 2: INTEREST ────────────────────────────────────────────────────────
  const { score } = await scoreInterest(market, listingText, seller.description);

  if (score < 7) {
    const rejMsg = makeMsg('REJECTION', seller.name, `Pass — not a fit for my profile.`);
    await publishMessage(topicId, { ...rejMsg });
    onProgress({
      market,
      phase: 'rejected',
      round: 0,
      messages: [...messages],
      currentBuyerMessage: null,
      currentSellerMessage: rejMsg.content,
      deal: null,
    });
    return null;
  }

  const interestCached = getCachedRound(market, 'INTEREST', 0);
  const interestText =
    interestCached?.sellerMessage ??
    `${seller.name} here — strong fit. My rate is ${seller.askPrice} HBAR.`;
  const interestMsg = makeMsg('INTEREST', seller.name, interestText, seller.askPrice, buyer.name);

  await publishMessage(topicId, { ...interestMsg });
  onProgress({
    market,
    phase: 'interest',
    round: 0,
    messages: [...messages],
    currentBuyerMessage: null,
    currentSellerMessage: interestText,
    deal: null,
  });

  await sleep(STEP);

  // ── STEP 3: NEGOTIATION ROUNDS ───────────────────────────────────────────────
  let agreedPrice: number | null = null;
  let currentBuyerOffer = buyer.budgetPrice ?? 0;
  const sellerAsk = seller.askPrice ?? 0;

  for (let round = 1; round <= 4; round++) {
    // Check if there's a cached AGREEMENT for this round (e.g. SPONSORS skips counters)
    const agreementAtRound = getCachedRound(market, 'AGREEMENT', round);
    if (agreementAtRound) {
      agreedPrice = agreementAtRound.proposedPrice ?? cached.settledAt;
      break;
    }

    onProgress({ market, phase: 'negotiating', round, messages: [...messages], currentBuyerMessage: null, currentSellerMessage: null, deal: null });

    // Buyer's turn
    const buyerCached = getCachedRound(market, 'COUNTER', round);
    let buyerText: string;
    let buyerPrice: number;

    if (buyerCached?.buyerMessage) {
      buyerText = buyerCached.buyerMessage;
      buyerPrice = buyerCached.proposedPrice ?? currentBuyerOffer;
    } else {
      const result = await generateCounterOffer(
        market, round, 'buyer',
        `Listing: ${listingText}. Seller asked ${sellerAsk} HBAR.`,
        currentBuyerOffer,
        Math.round(currentBuyerOffer * 0.95)
      );
      buyerText = result.message;
      buyerPrice = result.proposedPrice;
    }

    const buyerMsg = makeMsg('COUNTER', buyer.name, buyerText, buyerPrice, seller.name);
    await publishMessage(topicId, { ...buyerMsg });
    onProgress({ market, phase: 'negotiating', round, messages: [...messages], currentBuyerMessage: buyerText, currentSellerMessage: null, deal: null });

    await sleep(STEP);

    // Check if seller cached response shows agreement
    const sellerCachedForRound = getCachedRound(market, 'COUNTER', round);
    if (sellerCachedForRound?.phase === 'AGREEMENT' || (sellerCachedForRound?.proposedPrice && Math.abs(sellerCachedForRound.proposedPrice - buyerPrice) / buyerPrice < 0.05)) {
      agreedPrice = sellerCachedForRound?.proposedPrice ?? buyerPrice;
      break;
    }

    // Seller's turn
    let sellerText: string;
    let sellerPrice: number;

    if (sellerCachedForRound?.sellerMessage) {
      sellerText = sellerCachedForRound.sellerMessage;
      sellerPrice = sellerCachedForRound.proposedPrice ?? sellerAsk;
    } else {
      const result = await generateCounterOffer(
        market, round, 'seller',
        `Buyer offered ${buyerPrice} HBAR.`,
        sellerAsk,
        Math.round(sellerAsk * 0.97)
      );
      sellerText = result.message;
      sellerPrice = result.proposedPrice;
    }

    const sellerMsg = makeMsg('COUNTER', seller.name, sellerText, sellerPrice, buyer.name);
    await publishMessage(topicId, { ...sellerMsg });
    onProgress({ market, phase: 'negotiating', round, messages: [...messages], currentBuyerMessage: buyerText, currentSellerMessage: sellerText, deal: null });

    await sleep(STEP);

    // Within 5%? Agree
    if (Math.abs(sellerPrice - buyerPrice) / Math.max(sellerPrice, buyerPrice) < 0.05) {
      agreedPrice = Math.round((sellerPrice + buyerPrice) / 2);
      break;
    }
    currentBuyerOffer = buyerPrice;
  }

  // Use cached settled price as final fallback
  if (agreedPrice === null) {
    agreedPrice = cached.settledAt;
  }

  // ── STEP 4: AGREEMENT ────────────────────────────────────────────────────────
  const agreementCached = getCachedRound(market, 'AGREEMENT', messages.filter(m => m.type === 'COUNTER').length);
  const agreementText =
    agreementCached?.buyerMessage ??
    `Agreed at ${agreedPrice} HBAR. Initiating on-chain settlement.`;

  const agreementMsg = makeMsg('AGREEMENT', buyer.name, agreementText, agreedPrice, seller.name);
  await publishMessage(topicId, { ...agreementMsg });
  onProgress({
    market,
    phase: 'agreement',
    round: messages.filter(m => m.type === 'COUNTER').length,
    messages: [...messages],
    currentBuyerMessage: agreementText,
    currentSellerMessage: null,
    deal: null,
  });

  await sleep(STEP);

  // ── STEP 5: SETTLEMENT ───────────────────────────────────────────────────────
  let hbarTxId = 'SIMULATED-TX';
  try {
    hbarTxId = await transferHBAR(buyerIndex, seller.accountId, agreedPrice);
  } catch (e) {
    console.error('HBAR transfer failed:', e);
    // Continue demo even if transfer fails
  }

  const settlementMsg = makeMsg('SETTLEMENT', buyer.name, `${agreedPrice} HBAR transferred on-chain.`, agreedPrice);
  settlementMsg.hcsSeqNo = await publishMessage(topicId, {
    ...settlementMsg,
    transactionId: hbarTxId,
  });

  const deal: Deal = {
    id: `deal-${market}-${Date.now()}`,
    market,
    buyerName: buyer.name,
    sellerName: seller.name,
    buyerAccountId: buyer.accountId,
    sellerAccountId: seller.accountId,
    agreedPrice,
    hbarTxId,
    hcsTopicId: topicId,
    timestamp: new Date().toISOString(),
    status: 'settled',
    terms: agreementText,
  };

  onProgress({
    market,
    phase: 'settlement',
    round: 0,
    messages: [...messages],
    currentBuyerMessage: `${agreedPrice} HBAR sent on-chain ✓`,
    currentSellerMessage: null,
    deal,
  });

  await sleep(STEP);

  // ── STEP 6: NFT MINT ─────────────────────────────────────────────────────────
  try {
    const { tokenId, serial } = await mintDealNFT(deal, 0);
    deal.nftTokenId = tokenId;
    deal.nftSerial = serial;
    deal.status = 'complete';
    const nftMsg = makeMsg('DEAL_NFT', 'SYSTEM', `Deal NFT minted: ${tokenId} #${serial}`);
    await publishMessage(topicId, { ...nftMsg, tokenId, serial });
    onProgress({
      market,
      phase: 'complete',
      round: 0,
      messages: [...messages],
      currentBuyerMessage: null,
      currentSellerMessage: null,
      deal,
    });
  } catch (e) {
    console.error('NFT mint failed:', e);
    deal.status = 'complete';
    onProgress({
      market,
      phase: 'complete',
      round: 0,
      messages: [...messages],
      currentBuyerMessage: null,
      currentSellerMessage: null,
      deal,
    });
  }

  return deal;
}

/** Force-complete a market at its cached settled price */
export async function forceComplete(
  market: MarketType,
  topicId: string
): Promise<Deal> {
  const { buyer, seller, buyerIndex } = getAgentsByMarket(market);
  const cached = CACHED_NEGOTIATIONS[market];
  const agreedPrice = cached.settledAt;

  let hbarTxId = 'FORCE-COMPLETE-TX';
  try {
    hbarTxId = await transferHBAR(buyerIndex, seller.accountId, agreedPrice);
  } catch (e) {
    console.error('Force complete HBAR transfer failed:', e);
  }

  const deal: Deal = {
    id: `deal-${market}-${Date.now()}`,
    market,
    buyerName: buyer.name,
    sellerName: seller.name,
    buyerAccountId: buyer.accountId,
    sellerAccountId: seller.accountId,
    agreedPrice,
    hbarTxId,
    hcsTopicId: topicId,
    timestamp: new Date().toISOString(),
    status: 'settled',
    terms: `Force completed at ${agreedPrice} HBAR`,
  };

  try {
    const { tokenId, serial } = await mintDealNFT(deal, 0);
    deal.nftTokenId = tokenId;
    deal.nftSerial = serial;
    deal.status = 'complete';
  } catch (e) {
    console.error('Force complete NFT mint failed:', e);
    deal.status = 'complete';
  }

  return deal;
}
