export interface AgoraVerdictType {
  decision: string;
  confidence: string;
  summary: string;
  findings: Array<{ line: number; severity: string; text: string }>;
  recommendation: string;
}

export interface AgoraChatMsg {
  who: 'agent' | 'expert';
  name: string;
  text: string;
  tag: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  rate: number;
  realRate: number;
  reviews: number;
  accuracy: number;
  specialty: string;
  avgTime: string;
  accountId: string | undefined;
  agentIndex: number;
  recentVerdicts: Array<{ contract: string; decision: string; ago: string }>;
}

export interface AgoraResult {
  topicId: string;
  escrowTxId: string;
  settleTxId: string;
  refundTxId: string;
  elenaAccountId: string;
  codeAgentAccountId: string;
}

export interface AgoraEvent {
  step: string;
  data?: Record<string, unknown>;
}
