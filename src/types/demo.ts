export type CaseId = 'medical' | 'finance' | 'legal';

export type DemoStep =
  | 'idle'
  | 'scenario'
  | 'confidence'
  | 'discovery'
  | 'selection'
  | 'negotiating'
  | 'escrow'
  | 'reviewing'
  | 'verdict'
  | 'settlement'
  | 'reputation';

export interface RecentVerdict {
  contract: string;
  decision: string;
  ago: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  title: string;
  rate: number;
  reviews: number;
  accuracy: number;
  specialty: string;
  avgTime: string;
  colour: string;
  agentIndex: number;
  accountId: string | undefined;
  recentVerdicts: RecentVerdict[];
  /** Whether this expert is the one selected by the agent */
  isSelected: boolean;
}

export interface DemoScenario {
  title: string;
  agentTask: string;
  contextLines: string[];
}

export interface DemoConfidence {
  label: string;
  pct: number;
  message: string;
}

export interface DemoFinding {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  text: string;
}

export interface DemoVerdict {
  decision: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  findings: DemoFinding[];
  recommendation: string;
}

export interface DemoSettlement {
  expertDisplay: string;
  refundDisplay: string;
}

export interface ChatMsg {
  who: 'agent' | 'expert';
  name: string;
  text: string;
  tag: 'REQUEST' | 'OFFER' | 'COUNTER' | 'ACCEPT';
}

export interface DemoCase {
  id: CaseId;
  tab: string;
  icon: string;
  accentColour: string;
  scenario: DemoScenario;
  confidence: DemoConfidence;
  agentReasoning: string;
  experts: [ExpertProfile, ExpertProfile];
  chat: ChatMsg[];
  escrowAmount: string;
  verdict: DemoVerdict;
  settlement: DemoSettlement;
  reputationDelta: number;
}

export interface DemoEvent {
  step: DemoStep;
  data?: Record<string, unknown>;
}

export interface DemoResult {
  topicId: string;
  escrowTxId: string;
  settleTxId: string;
  refundTxId: string;
}
