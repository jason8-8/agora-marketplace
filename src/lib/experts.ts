import type { ExpertProfile, AgoraChatMsg, AgoraVerdictType } from '@/types/agora';

export const EXPERTS: ExpertProfile[] = [
  {
    id: 'elena',
    name: 'Elena Crypto',
    title: 'Senior Smart Contract Auditor',
    rate: 40,
    realRate: 0.8,
    reviews: 47,
    accuracy: 92,
    specialty: 'DeFi & Token Contracts',
    avgTime: '12 min',
    accountId: process.env.HEDERA_AGENT_6_ID,
    agentIndex: 5,
    recentVerdicts: [
      { contract: 'ERC-20 token audit', decision: 'Approved', ago: '3 days ago' },
      { contract: 'DEX router review', decision: 'Rejected (bug found)', ago: '1 week ago' },
      { contract: 'Staking contract', decision: 'Approved', ago: '2 weeks ago' },
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Dev',
    title: 'Full-Stack Code Reviewer',
    rate: 20,
    realRate: 0.4,
    reviews: 12,
    accuracy: 78,
    specialty: 'General Web3',
    avgTime: '8 min',
    accountId: process.env.HEDERA_AGENT_2_ID,
    agentIndex: 1,
    recentVerdicts: [
      { contract: 'NFT marketplace review', decision: 'Approved', ago: '5 days ago' },
      { contract: 'Wallet integration', decision: 'Approved', ago: '2 weeks ago' },
    ],
  },
];

export const AGORA_VERDICT: AgoraVerdictType = {
  decision: 'APPROVED WITH RECOMMENDATIONS',
  confidence: 'HIGH',
  summary: 'Contract is secure for deployment. No critical vulnerabilities found.',
  findings: [
    {
      line: 14,
      severity: 'LOW',
      text: 'Add a zero-address check on transfer() to prevent accidental burns',
    },
    {
      line: 22,
      severity: 'INFO',
      text: 'Emit event after state change, not before — best practice for reentrancy safety',
    },
  ],
  recommendation: 'Deploy after implementing suggestion #1.',
};

export const AGORA_CHAT: AgoraChatMsg[] = [
  {
    who: 'agent',
    name: 'CodeAgent',
    text: "I need a security review of an ERC-20 token contract. 28 lines of Solidity. Can you review within 1 hour? My budget is 50 HBAR.",
    tag: 'REQUEST',
  },
  {
    who: 'expert',
    name: "Elena's Agent",
    text: "I can review within 30 minutes. My rate is 40 HBAR for contracts under 50 lines. Includes a written verdict with line-specific findings.",
    tag: 'OFFER',
  },
  {
    who: 'agent',
    name: 'CodeAgent',
    text: "Can we do 35 HBAR? It's a standard ERC-20 with minor modifications.",
    tag: 'COUNTER',
  },
  {
    who: 'expert',
    name: "Elena's Agent",
    text: "35 HBAR for a standard review. If I find critical issues requiring detailed write-up, the rate goes to 40. Fair?",
    tag: 'COUNTER',
  },
  {
    who: 'agent',
    name: 'CodeAgent',
    text: "Agreed. 35 base, 40 if critical. Depositing 40 HBAR to escrow now.",
    tag: 'ACCEPT',
  },
];

export const SOLIDITY_CODE = `pragma solidity ^0.8.19;

contract SimpleToken {
    string public name = "AgentToken";
    string public symbol = "AGT";
    uint256 public totalSupply;
    mapping(address => uint256) balances;

    constructor(uint256 _supply) {
        totalSupply = _supply;
        balances[msg.sender] = _supply;
    }

    function transfer(address to, uint256 amt)
        public returns (bool)
    {
        require(balances[msg.sender] >= amt);
        balances[msg.sender] -= amt;
        balances[to] += amt;
        emit Transfer(msg.sender, to, amt);
        return true;
    }

    event Transfer(address from, address to, uint256 v);
}`;
