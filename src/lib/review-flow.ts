import { createTopic, publishMessage } from './hcs';
import { operatorTransferHBAR } from './hbar';
import { AGORA_CHAT, AGORA_VERDICT, EXPERTS } from './experts';
import type { AgoraEvent, AgoraResult } from '@/types/agora';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const STEP_MS = 1200;

export async function runAgoraFlow(
  onProgress: (event: AgoraEvent) => void
): Promise<AgoraResult> {
  const elena = EXPERTS[0];
  const codeAgentAccountId = process.env.HEDERA_AGENT_2_ID ?? '';
  const escrowAccountId = process.env.HEDERA_AGENT_4_ID ?? '';
  const elenaAccountId = elena.accountId ?? '';

  // ── STEP 1: Create HCS topic ────────────────────────────────────────────────
  const topicId = await createTopic(`agora-review-${Date.now()}`);
  onProgress({ step: 'TOPIC_CREATED', data: { topicId } });
  await sleep(800);

  // ── STEP 2: Scanning ────────────────────────────────────────────────────────
  onProgress({ step: 'SCANNING' });
  await sleep(STEP_MS);

  // ── STEP 3: Expert selection ─────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'EXPERT_EVALUATION',
    reasoning: 'Elena: 47 reviews, 92% accuracy, DeFi specialist — direct match for ERC-20. Marcus: 12 reviews, 78%. Selecting Elena.',
    selected: 'elena',
  });
  onProgress({ step: 'SELECTED', data: { expertId: 'elena' } });
  await sleep(STEP_MS);

  // ── STEP 4: Negotiation messages ─────────────────────────────────────────────
  for (let i = 0; i < AGORA_CHAT.length; i++) {
    const msg = AGORA_CHAT[i];
    await publishMessage(topicId, {
      type: msg.tag,
      from: msg.name,
      content: msg.text,
    });
    onProgress({ step: 'CHAT', data: { index: i, msg } });
    await sleep(STEP_MS);
  }

  // ── STEP 5: Escrow deposit ────────────────────────────────────────────────────
  // Operator signs on behalf of CodeAgent → escrow. Small real amount, operator pays fees.
  let escrowTxId = 'SIMULATED-ESCROW-TX';
  try {
    escrowTxId = await operatorTransferHBAR(escrowAccountId, 0.05);
  } catch (e) {
    console.error('Escrow deposit failed:', e);
  }

  await publishMessage(topicId, {
    type: 'ESCROW_DEPOSIT',
    txId: escrowTxId,
    displayAmount: '40 HBAR',
    escrowAccount: escrowAccountId,
  });
  onProgress({ step: 'ESCROW', data: { txId: escrowTxId } });
  await sleep(STEP_MS);

  // ── STEP 6: Expert reviewing ──────────────────────────────────────────────────
  onProgress({ step: 'REVIEWING' });
  await sleep(STEP_MS * 2);

  // ── STEP 7: Verdict ───────────────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'VERDICT',
    verdict: AGORA_VERDICT,
  });
  onProgress({ step: 'VERDICT' });
  await sleep(STEP_MS);

  // ── STEP 8: Settlement ────────────────────────────────────────────────────────
  // Operator signs on behalf of escrow → release to Elena and refund to CodeAgent.
  let settleTxId = 'SIMULATED-SETTLE-TX';
  let refundTxId = 'SIMULATED-REFUND-TX';
  try {
    settleTxId = await operatorTransferHBAR(elenaAccountId, 0.04);
  } catch (e) {
    console.error('Settlement to Elena failed:', e);
  }
  try {
    refundTxId = await operatorTransferHBAR(codeAgentAccountId, 0.01);
  } catch (e) {
    console.error('Refund to CodeAgent failed:', e);
  }

  await publishMessage(topicId, {
    type: 'SETTLEMENT',
    settleTxId,
    refundTxId,
    displayElena: '35 HBAR',
    displayRefund: '5 HBAR',
  });
  onProgress({ step: 'SETTLEMENT', data: { settleTxId, refundTxId } });
  await sleep(STEP_MS);

  // ── STEP 9: Reputation update ─────────────────────────────────────────────────
  await publishMessage(topicId, {
    type: 'REPUTATION_UPDATE',
    expert: 'elena',
    newReviews: 48,
    accuracy: 92,
  });
  onProgress({ step: 'REPUTATION' });

  return {
    topicId,
    escrowTxId,
    settleTxId,
    refundTxId,
    elenaAccountId,
    codeAgentAccountId,
  };
}
