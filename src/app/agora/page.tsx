'use client';

import { useEffect, useRef, useState } from 'react';
import { EXPERTS, AGORA_VERDICT } from '@/lib/experts';
import { AgentPanel } from '@/components/agora/AgentPanel';
import { ExpertCard } from '@/components/agora/ExpertCard';
import { EscrowAnimation } from '@/components/agora/EscrowAnimation';
import { VerdictCard } from '@/components/agora/VerdictCard';
import type { AgoraChatMsg, AgoraResult } from '@/types/agora';

type AgoraStep =
  | 'input' | 'scanning' | 'selecting' | 'negotiating'
  | 'escrow' | 'reviewing' | 'verdict' | 'settlement'
  | 'reputation' | 'complete';

const STEP_LABELS: Record<AgoraStep, string> = {
  input: 'Idle',
  scanning: 'Scanning Experts',
  selecting: 'Selecting Expert',
  negotiating: 'Negotiating Terms',
  escrow: 'Locking Escrow',
  reviewing: 'Expert Reviewing',
  verdict: 'Verdict Delivered',
  settlement: 'Settling Payment',
  reputation: 'Updating Reputation',
  complete: 'Complete',
};

const STEP_ORDER: AgoraStep[] = [
  'scanning', 'selecting', 'negotiating', 'escrow',
  'reviewing', 'verdict', 'settlement', 'reputation', 'complete',
];

const REASONING_BY_STEP: Partial<Record<AgoraStep, string>> = {
  scanning: 'Querying expert registry… filtering by solidity, DeFi specialty, accuracy > 80%…',
  selecting: 'Elena: 47 reviews, 92% accuracy, DeFi specialist → score 94. Marcus: 12 reviews, 78% → score 62. Selecting Elena.',
  negotiating: 'Budget: 50 HBAR. Elena asks 40 HBAR. Attempting counter-offer at 35 HBAR…',
  escrow: 'Depositing 40 HBAR to escrow account. If critical issues found → full 40 HBAR. Otherwise → 35 HBAR + 5 HBAR refund.',
  reviewing: 'Waiting for Elena to complete review… estimated 12 minutes.',
  verdict: 'Parsing verdict… decision: APPROVED WITH RECOMMENDATIONS. Confidence: HIGH. Findings: 2.',
  settlement: 'No critical issues found. Releasing 35 HBAR to Elena, refunding 5 HBAR.',
  reputation: 'Recording review on HCS. Elena: 47 → 48 reviews. Accuracy remains at 92%.',
};

const TAG_COLOR: Record<string, string> = {
  REQUEST: '#22d3ee',
  OFFER: '#a855f7',
  COUNTER: '#fbbf24',
  ACCEPT: '#22c55e',
};

function hashscanTx(txId: string) {
  if (!txId || txId.startsWith('SIMULATED')) return null;
  const clean = txId.replace(/@/, '-').replace(/\./g, '-');
  return `https://hashscan.io/testnet/transaction/${clean}`;
}

function hashscanTopic(topicId: string) {
  return `https://hashscan.io/testnet/topic/${topicId}`;
}

const C = {
  bg: '#080810', card: '#0e0e1c', border: '#1c1c38',
  cyan: '#22d3ee', purple: '#a855f7', green: '#22c55e',
  dim: '#5a5a80', text: '#e4e4f0',
};

export default function AgoraPage() {
  const [step, setStep] = useState<AgoraStep>('input');
  const [chat, setChat] = useState<AgoraChatMsg[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [updatedReviews, setUpdatedReviews] = useState<number | undefined>(undefined);
  const [txLinks, setTxLinks] = useState<Partial<AgoraResult>>({});
  const [hcsMessages, setHcsMessages] = useState<string[]>([]);
  const [budget, setBudget] = useState(50);
  const [running, setRunning] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  function launch() {
    if (running) return;
    setRunning(true);
    setStep('scanning');
    setChat([]);
    setSelectedExpert(null);
    setShowVerdict(false);
    setUpdatedReviews(undefined);
    setTxLinks({});
    setHcsMessages([]);
    setBudget(50);

    const es = new EventSource('/api/agora');
    esRef.current = es;

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === 'PROGRESS') {
        const { step: s, data } = msg;

        if (s === 'TOPIC_CREATED') {
          setHcsMessages((prev) => [...prev, `Topic created: ${data?.topicId}`]);
          setTxLinks((prev) => ({ ...prev, topicId: data?.topicId as string }));
        } else if (s === 'SCANNING') {
          setStep('scanning');
          setHcsMessages((prev) => [...prev, 'Scanning expert registry…']);
        } else if (s === 'SELECTED') {
          setStep('selecting');
          setSelectedExpert(data?.expertId as string);
          setHcsMessages((prev) => [...prev, `Expert selected: ${data?.expertId}`]);
        } else if (s === 'CHAT') {
          setStep('negotiating');
          const chatMsg = data?.msg as AgoraChatMsg;
          setChat((prev) => [...prev, chatMsg]);
        } else if (s === 'ESCROW') {
          setStep('escrow');
          setBudget(10);
          const txId = data?.txId as string;
          setTxLinks((prev) => ({ ...prev, escrowTxId: txId }));
          setHcsMessages((prev) => [...prev, `Escrow deposit: ${txId}`]);
        } else if (s === 'REVIEWING') {
          setStep('reviewing');
          setHcsMessages((prev) => [...prev, 'Expert reviewing contract…']);
        } else if (s === 'VERDICT') {
          setStep('verdict');
          setShowVerdict(true);
          setHcsMessages((prev) => [...prev, 'Verdict published to HCS']);
        } else if (s === 'SETTLEMENT') {
          setStep('settlement');
          setBudget(5);
          const { settleTxId, refundTxId } = data as { settleTxId: string; refundTxId: string };
          setTxLinks((prev) => ({ ...prev, settleTxId, refundTxId }));
          setHcsMessages((prev) => [...prev, `Settlement: ${settleTxId}`, `Refund: ${refundTxId}`]);
        } else if (s === 'REPUTATION') {
          setStep('reputation');
          setUpdatedReviews(48);
          setHcsMessages((prev) => [...prev, 'Reputation updated on HCS']);
        }
      }

      if (msg.type === 'COMPLETE') {
        setStep('complete');
        setRunning(false);
        es.close();
      }

      if (msg.type === 'ERROR') {
        setRunning(false);
        setStep('complete');
        es.close();
      }
    };

    es.onerror = () => {
      setRunning(false);
      es.close();
    };
  }

  function stop() {
    esRef.current?.close();
    setRunning(false);
    if (step === 'input') return;
    setStep('complete');
  }

  const currentStepIndex = STEP_ORDER.indexOf(step as AgoraStep);

  if (step === 'input') {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '36px 40px', width: 480, textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🤖</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>
            Agora — AI Agent Hires Human Expert
          </div>
          <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, marginBottom: 24 }}>
            Watch an AI coding agent discover, negotiate with, and hire a human smart contract
            auditor — with real HBAR escrow and HCS audit trail on Hedera Testnet.
          </div>
          <div style={{
            background: '#080810', border: `1px solid ${C.border}`, borderRadius: 10,
            padding: '12px 16px', marginBottom: 20, textAlign: 'left',
          }}>
            <div style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
              TASK
            </div>
            <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
              Review SimpleToken.sol (28-line ERC-20) for security vulnerabilities before mainnet deployment.
            </div>
          </div>
          <button
            onClick={launch}
            style={{
              background: C.cyan, color: '#000', border: 'none', borderRadius: 8,
              padding: '11px 32px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              width: '100%',
            }}
          >
            Launch Agent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes msgSlide { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes agoraShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes charIdle {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-2px); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '12px 24px', borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.cyan }}>AGORA</div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STEP_ORDER.map((s, i) => (
            <div key={s} title={STEP_LABELS[s]} style={{
              width: i <= currentStepIndex ? 18 : 6, height: 6, borderRadius: 3,
              background: i < currentStepIndex ? C.green
                : i === currentStepIndex ? C.cyan
                : C.border,
              transition: 'all 0.4s ease-out',
            }} />
          ))}
        </div>

        <div style={{ fontSize: 11, color: C.cyan, fontWeight: 700 }}>
          {STEP_LABELS[step] ?? ''}
        </div>

        <div style={{ flex: 1 }} />

        {running && (
          <button
            onClick={stop}
            style={{
              background: 'transparent', border: `1px solid #ef444488`, color: '#ef4444',
              borderRadius: 6, padding: '5px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Stop
          </button>
        )}
      </div>

      {/* 3-column grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '28% 1fr 28%',
        gap: 16, padding: '16px 20px', alignItems: 'start',
      }}>

        {/* ── LEFT: Agent Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AgentPanel
            step={step}
            budget={budget}
            reasoning={REASONING_BY_STEP[step]}
          />
          <EscrowAnimation step={step} />
        </div>

        {/* ── CENTRE: Activity feed + verdict + receipt ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Negotiation chat */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.dim, letterSpacing: '0.08em', marginBottom: 10 }}>
              NEGOTIATION LOG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
              {chat.length === 0 && (
                <div style={{ fontSize: 11, color: C.dim, fontStyle: 'italic' }}>
                  {step === 'scanning' ? 'Scanning expert registry…'
                    : step === 'selecting' ? 'Selecting best match…'
                    : 'Waiting for negotiation…'}
                </div>
              )}
              {chat.map((msg, i) => (
                <div key={i} style={{ animation: 'msgSlide 0.3s ease-out' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                      color: TAG_COLOR[msg.tag] ?? C.dim,
                      background: (TAG_COLOR[msg.tag] ?? C.dim) + '18',
                    }}>
                      {msg.tag}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: msg.who === 'agent' ? C.cyan : '#a855f7' }}>
                      {msg.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5, paddingLeft: 2 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Verdict */}
          {showVerdict && (
            <div style={{ animation: 'popIn 0.4s ease-out' }}>
              <VerdictCard verdict={AGORA_VERDICT} />
            </div>
          )}

          {/* Deal receipt */}
          {(step === 'settlement' || step === 'reputation' || step === 'complete') && (
            <div style={{
              background: C.card, border: `1px solid ${C.green}44`,
              borderRadius: 12, padding: '14px 16px',
              animation: 'fadeIn 0.4s ease-out',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.green, letterSpacing: '0.08em', marginBottom: 10 }}>
                DEAL RECEIPT
              </div>

              {/* HCS Log */}
              <ReceiptRow
                label="HCS Audit Trail"
                value={txLinks.topicId ? `Topic ${txLinks.topicId}` : 'Recording…'}
                href={txLinks.topicId ? hashscanTopic(txLinks.topicId) : null}
                color={C.cyan}
                explain="All negotiation steps, escrow details, and verdict are permanently logged to Hedera Consensus Service."
              />

              {/* Escrow tx */}
              <ReceiptRow
                label="Escrow Deposit"
                value={txLinks.escrowTxId?.startsWith('SIMULATED') ? 'tx confirming…' : `40 HBAR locked`}
                href={txLinks.escrowTxId ? hashscanTx(txLinks.escrowTxId) : null}
                color="#fbbf24"
                explain="CodeAgent locked 40 HBAR in escrow before review began. Released only after verdict."
              />

              {/* Settlement */}
              <ReceiptRow
                label="Payment to Elena"
                value={txLinks.settleTxId?.startsWith('SIMULATED') ? 'settling…' : '35 HBAR sent'}
                href={txLinks.settleTxId ? hashscanTx(txLinks.settleTxId) : null}
                color={C.green}
                explain="No critical issues found — 35 HBAR base rate paid to Elena."
              />

              {/* Refund */}
              <ReceiptRow
                label="Refund"
                value={txLinks.refundTxId?.startsWith('SIMULATED') ? 'processing…' : '5 HBAR returned'}
                href={txLinks.refundTxId ? hashscanTx(txLinks.refundTxId) : null}
                color="#60a5fa"
                explain="5 HBAR returned to CodeAgent as no critical issues were found."
              />
            </div>
          )}
        </div>

        {/* ── RIGHT: Expert cards + HCS log ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EXPERTS.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              selected={selectedExpert === expert.id || step === 'scanning'}
              updatedReviews={expert.id === 'elena' ? updatedReviews : undefined}
            />
          ))}

          {/* HCS log */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.dim, letterSpacing: '0.08em', marginBottom: 8 }}>
              HCS MESSAGES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
              {hcsMessages.length === 0 && (
                <div style={{ fontSize: 10, color: C.dim, fontStyle: 'italic' }}>Awaiting…</div>
              )}
              {hcsMessages.map((m, i) => (
                <div key={i} style={{
                  fontSize: 9, color: '#a0aec0', fontFamily: 'monospace',
                  borderLeft: `2px solid ${C.cyan}44`, paddingLeft: 6,
                  animation: 'fadeIn 0.3s ease-out',
                }}>
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Receipt row ── */
function ReceiptRow({
  label, value, href, color, explain,
}: {
  label: string;
  value: string;
  href: string | null;
  color: string;
  explain: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#5a5a80' }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {href ? (
            <a
              href={href} target="_blank" rel="noreferrer"
              style={{ fontSize: 10, fontWeight: 700, color, textDecoration: 'none' }}
            >
              {value} ↗
            </a>
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, color }}>{value}</span>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 10, color: '#5a5a80', padding: '0 2px',
            }}
            title="Explain"
          >
            ?
          </button>
        </div>
      </div>
      {open && (
        <div style={{
          fontSize: 10, color: '#a0aec0', background: '#14141e',
          borderRadius: 5, padding: '6px 8px', marginTop: 4,
          lineHeight: 1.5, animation: 'fadeIn 0.2s ease-out',
        }}>
          {explain}
        </div>
      )}
    </div>
  );
}
