import { createTopic, publishMessage } from './hcs';
import { operatorTransferHBAR } from './hbar';
import { CASE_MAP } from '@/data/agora-cases';
import type { CaseId, DemoEvent, DemoResult } from '@/types/demo';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runDemoFlow(
  caseId: CaseId,
  onProgress: (event: DemoEvent) => void,
  fast = false
): Promise<DemoResult> {
  const demo = CASE_MAP[caseId];
  if (!demo) throw new Error(`Unknown case: ${caseId}`);

  const S = (ms: number) => sleep(fast ? Math.round(ms * 0.4) : ms);

  const escrowAccountId = process.env.HEDERA_AGENT_4_ID ?? '';
  const expertAccountId = demo.experts[0].accountId ?? '';
  const agentAccountId = process.env.HEDERA_AGENT_2_ID ?? '';

  // ── 1. Create HCS topic ───────────────────────────────────────────────────
  const topicId = await createTopic(`agora-${caseId}-${Date.now()}`);
  onProgress({ step: 'scenario', data: { topicId } });

  await publishMessage(topicId, {
    type: 'REVIEW_REQUEST',
    caseId,
    task: demo.scenario.agentTask,
    confidence: demo.confidence.pct,
  });
  await S(2000);

  // ── 2. Confidence check ───────────────────────────────────────────────────
  onProgress({ step: 'confidence' });
  await S(3000);

  // ── 3. Expert discovery ───────────────────────────────────────────────────
  onProgress({ step: 'discovery' });
  await S(2500);

  // ── 4. Expert selection ───────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'EXPERT_EVALUATION',
    reasoning: demo.agentReasoning,
    selected: demo.experts[0].id,
  });
  onProgress({ step: 'selection', data: { expertId: demo.experts[0].id } });
  await S(2500);

  // ── 5. Negotiation chat ───────────────────────────────────────────────────
  for (let i = 0; i < demo.chat.length; i++) {
    const msg = demo.chat[i];
    await publishMessage(topicId, {
      type: msg.tag,
      from: msg.name,
      content: msg.text,
    });
    onProgress({ step: 'negotiating', data: { index: i, msg } });
    await S(2000);
  }

  // ── 6. Escrow deposit ─────────────────────────────────────────────────────
  let escrowTxId = 'SIMULATED-ESCROW-TX';
  try {
    escrowTxId = await operatorTransferHBAR(escrowAccountId, 0.05);
  } catch (e) {
    console.error('Escrow deposit failed:', e);
  }
  await publishMessage(topicId, {
    type: 'ESCROW_DEPOSIT',
    txId: escrowTxId,
    displayAmount: demo.escrowAmount,
    escrowAccount: escrowAccountId,
  });
  onProgress({ step: 'escrow', data: { txId: escrowTxId } });
  await S(1200);

  // ── 7. Expert reviewing ───────────────────────────────────────────────────
  onProgress({ step: 'reviewing' });
  await S(3500);

  // ── 8. Verdict ────────────────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'VERDICT',
    caseId,
    verdict: demo.verdict,
  });
  onProgress({ step: 'verdict' });
  await S(1200);

  // ── 9. Settlement ─────────────────────────────────────────────────────────
  let settleTxId = 'SIMULATED-SETTLE-TX';
  let refundTxId = 'SIMULATED-REFUND-TX';
  try {
    settleTxId = await operatorTransferHBAR(expertAccountId, 0.04);
  } catch (e) {
    console.error('Settlement failed:', e);
  }
  try {
    refundTxId = await operatorTransferHBAR(agentAccountId, 0.01);
  } catch (e) {
    console.error('Refund failed:', e);
  }
  await publishMessage(topicId, {
    type: 'SETTLEMENT',
    settleTxId,
    refundTxId,
    displayExpert: demo.settlement.expertDisplay,
    displayRefund: demo.settlement.refundDisplay,
  });
  onProgress({ step: 'settlement', data: { settleTxId, refundTxId } });
  await S(1000);

  // ── 10. Reputation update ─────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'REPUTATION_UPDATE',
    expert: demo.experts[0].id,
    newReviews: demo.experts[0].reviews + demo.reputationDelta,
    accuracy: demo.experts[0].accuracy,
  });
  onProgress({ step: 'reputation' });

  return { topicId, escrowTxId, settleTxId, refundTxId };
}
