export type MarketType = 'SPEAKERS' | 'TALENT' | 'SPONSORS';

export type NegotiationType =
  | 'LISTING'
  | 'INTEREST'
  | 'COUNTER'
  | 'AGREEMENT'
  | 'SETTLEMENT'
  | 'DEAL_NFT'
  | 'REJECTION';

export type NegotiationPhase =
  | 'idle'
  | 'listing'
  | 'interest'
  | 'negotiating'
  | 'agreement'
  | 'settlement'
  | 'complete'
  | 'rejected';

export interface AgentProfile {
  id: string;
  name: string;
  role: 'buyer' | 'seller';
  market: MarketType;
  accountId: string;
  privateKey: string;
  pixelColor: string;
  budgetPrice?: number;   // buyer's max budget
  askPrice?: number;      // seller's initial ask
  description: string;
}

export interface NegotiationMessage {
  id: string;
  type: NegotiationType;
  market: MarketType;
  from: string;
  to?: string;
  content: string;
  price?: number;
  timestamp: string;
  hcsSeqNo?: number;
}

export interface Deal {
  id: string;
  market: MarketType;
  buyerName: string;
  sellerName: string;
  buyerAccountId: string;
  sellerAccountId: string;
  agreedPrice: number;
  hbarTxId: string;
  nftTokenId?: string;
  nftSerial?: number;
  hcsTopicId: string;
  timestamp: string;
  status: 'pending' | 'settled' | 'complete';
  terms: string;
}

export interface NegotiationState {
  market: MarketType;
  phase: NegotiationPhase;
  round: number;
  topicId?: string;
  messages: NegotiationMessage[];
  currentBuyerMessage: string | null;
  currentSellerMessage: string | null;
  deal: Deal | null;
  error?: string;
}

export interface MarketplaceState {
  status: 'idle' | 'running' | 'complete';
  negotiations: Record<MarketType, NegotiationState>;
  deals: Deal[];
  hcsMessages: NegotiationMessage[];
  totalHBAR: number;
  activeAgents: number;
}

export interface CachedRound {
  round: number;
  phase: NegotiationType;
  buyerMessage: string | null;
  sellerMessage: string | null;
  fitScore?: number;
  proposedPrice?: number;
}

export interface CachedNegotiation {
  settledAt: number;
  rounds: CachedRound[];
}
