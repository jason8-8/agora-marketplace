import type { AgentProfile, CachedNegotiation, MarketType } from '@/types';

export const AGENT_PROFILES: AgentProfile[] = [
  // SPEAKERS market
  {
    id: 'agent-speaker-buyer',
    name: 'TechConf Organiser',
    role: 'buyer',
    market: 'SPEAKERS',
    accountId: process.env.HEDERA_AGENT_1_ID || '',
    privateKey: process.env.HEDERA_AGENT_1_KEY || '',
    pixelColor: '#8B5CF6',
    budgetPrice: 9,
    description: 'Seeking AI/blockchain keynote speaker for 800-person tech conference. London, May 2026.',
  },
  {
    id: 'agent-speaker-seller',
    name: 'Dr. Sarah Chen',
    role: 'seller',
    market: 'SPEAKERS',
    accountId: process.env.HEDERA_AGENT_2_ID || '',
    privateKey: process.env.HEDERA_AGENT_2_KEY || '',
    pixelColor: '#A78BFA',
    askPrice: 10,
    description: 'Agentic AI researcher. Keynote speaker at ETHDenver, Web Summit, DevConnect.',
  },

  // TALENT market
  {
    id: 'agent-talent-buyer',
    name: 'BlockStart Ltd',
    role: 'buyer',
    market: 'TALENT',
    accountId: process.env.HEDERA_AGENT_3_ID || '',
    privateKey: process.env.HEDERA_AGENT_3_KEY || '',
    pixelColor: '#3B82F6',
    budgetPrice: 9,
    description: 'Hiring senior full-stack Web3 developer. 12-month contract, remote-first.',
  },
  {
    id: 'agent-talent-seller',
    name: 'Alex Developer',
    role: 'seller',
    market: 'TALENT',
    accountId: process.env.HEDERA_AGENT_4_ID || '',
    privateKey: process.env.HEDERA_AGENT_4_KEY || '',
    pixelColor: '#60A5FA',
    askPrice: 10,
    description: 'TypeScript, Solidity, React. 5 years. 3 DeFi protocols shipped.',
  },

  // SPONSORS market
  {
    id: 'agent-sponsor-buyer',
    name: 'Durham Ent. Society',
    role: 'buyer',
    market: 'SPONSORS',
    accountId: process.env.HEDERA_AGENT_5_ID || '',
    privateKey: process.env.HEDERA_AGENT_5_KEY || '',
    pixelColor: '#22C55E',
    budgetPrice: 4,
    description: 'Seeking lead sponsor for Zero-to-One Demo Day. 800 members, 60% devs.',
  },
  {
    id: 'agent-sponsor-seller',
    name: 'CryptoVentures Fund',
    role: 'seller',
    market: 'SPONSORS',
    accountId: process.env.HEDERA_AGENT_6_ID || '',
    privateKey: process.env.HEDERA_AGENT_6_KEY || '',
    pixelColor: '#4ADE80',
    askPrice: 4,
    description: 'Web3 VC fund. Sponsors university events with AI/blockchain talent pipelines.',
  },
];

export const CACHED_NEGOTIATIONS: Record<MarketType, CachedNegotiation> = {
  SPEAKERS: {
    settledAt: 8,
    rounds: [
      {
        round: 0,
        phase: 'LISTING',
        buyerMessage:
          'TechConf 2026 seeking AI keynote speaker. Topic: agentic AI & autonomous systems. 800 engineers. London, 15 May. Budget: 9 HBAR.',
        sellerMessage: null,
        fitScore: undefined,
      },
      {
        round: 0,
        phase: 'INTEREST',
        buyerMessage: null,
        sellerMessage:
          'Dr. Sarah Chen — 15 yrs agentic AI. Keynoted ETHDenver & Web Summit. Rate: 10 HBAR + travel. Available 15 May. Strong fit.',
        fitScore: 9,
      },
      {
        round: 1,
        phase: 'COUNTER',
        buyerMessage:
          'Great profile. We can offer 8 HBAR with full travel covered. Deal?',
        sellerMessage: null,
        proposedPrice: 8,
      },
      {
        round: 1,
        phase: 'COUNTER',
        buyerMessage: null,
        sellerMessage:
          'Accepted. 8 HBAR + travel is fair. Confirm the 10am keynote slot on Day 2.',
        proposedPrice: 8,
      },
      {
        round: 2,
        phase: 'AGREEMENT',
        buyerMessage:
          'Day 2, 10am keynote confirmed. Initiating on-chain settlement now.',
        sellerMessage: null,
        proposedPrice: 8,
      },
    ],
  },

  TALENT: {
    settledAt: 8,
    rounds: [
      {
        round: 0,
        phase: 'LISTING',
        buyerMessage:
          'BlockStart Ltd hiring: senior blockchain dev, 12-month contract. TypeScript + Hedera SDK required. Budget: 9 HBAR deposit. Remote.',
        sellerMessage: null,
        fitScore: undefined,
      },
      {
        round: 0,
        phase: 'INTEREST',
        buyerMessage: null,
        sellerMessage:
          'Alex Developer — 5 yrs TypeScript/Solidity, 3 DeFi protocols. Deep Hedera SDK experience. Rate: 10 HBAR deposit. Available immediately.',
        fitScore: 8,
      },
      {
        round: 1,
        phase: 'COUNTER',
        buyerMessage:
          "Strong fit. We can do 8 HBAR deposit to lock in the contract. That's our ceiling.",
        sellerMessage: null,
        proposedPrice: 8,
      },
      {
        round: 1,
        phase: 'COUNTER',
        buyerMessage: null,
        sellerMessage:
          "8 HBAR deposit accepted. I value the Hedera-first stack. Let's close this.",
        proposedPrice: 8,
      },
      {
        round: 2,
        phase: 'AGREEMENT',
        buyerMessage:
          '12-month contract confirmed. Sending 8 HBAR on-chain commitment now.',
        sellerMessage: null,
        proposedPrice: 8,
      },
    ],
  },

  SPONSORS: {
    settledAt: 4,
    rounds: [
      {
        round: 0,
        phase: 'LISTING',
        buyerMessage:
          'Durham Ent. Society — Zero-to-One Demo Day. 800 registered: 60% devs, 30% founders. Logo, keynote slot, talent pipeline. Sponsorship: 4 HBAR.',
        sellerMessage: null,
        fitScore: undefined,
      },
      {
        round: 0,
        phase: 'INTEREST',
        buyerMessage: null,
        sellerMessage:
          'CryptoVentures Fund here. 800 devs + founders is exactly our thesis. 4 HBAR sponsorship confirmed.',
        fitScore: 9,
      },
      {
        round: 1,
        phase: 'AGREEMENT',
        buyerMessage:
          '4 HBAR confirmed for lead sponsorship. Minting deal NFT as on-chain proof. Welcome aboard.',
        sellerMessage: null,
        proposedPrice: 4,
      },
    ],
  },
};
