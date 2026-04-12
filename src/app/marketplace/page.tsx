'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGORA_CASES } from '@/data/agora-cases';
import { AgentPanel } from '@/components/demo/AgentPanel';
import { ExpertCard } from '@/components/demo/ExpertCard';
import { VerdictCard } from '@/components/demo/VerdictCard';
import { ProgressBar } from '@/components/demo/ProgressBar';
import { TypingIndicator } from '@/components/demo/TypingIndicator';
import { initAudio, playBlip, playChord, playChaChing, playClick } from '@/lib/audio';
import { DirectorNotifications } from '@/components/demo/DirectorNotifications';
import type { CaseId, DemoStep, ChatMsg, DemoResult, DemoVerdict } from '@/types/demo';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatEntry extends ChatMsg {
  id: number;
  showTyping?: boolean;
}

interface PageState {
  step: DemoStep;
  chat: ChatEntry[];
  showTyping: boolean;
  selectedExpert: string | null;
  showVerdict: boolean;
  updatedReviews: number | undefined;
  result: DemoResult | null;
  budget: number;
  hcsMessages: string[];
  running: boolean;
}

const INITIAL_STATE: PageState = {
  step: 'idle',
  chat: [],
  showTyping: false,
  selectedExpert: null,
  showVerdict: false,
  updatedReviews: undefined,
  result: null,
  budget: 60,
  hcsMessages: [],
  running: false,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Approximate HBAR → GBP. 1 HBAR ≈ $0.086 × 0.79 GBP/USD ≈ £0.068 */
const HBAR_GBP = 0.068;

function toGBP(hbarDisplay: string): string {
  const num = parseFloat(hbarDisplay.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return '';
  const gbp = num * HBAR_GBP;
  return gbp < 1 ? `≈ ${(gbp * 100).toFixed(0)}p` : `≈ £${gbp.toFixed(2)}`;
}

function hashscanTx(txId: string): string {
  const formatted = txId.replace('@', '-').replace(/\.(\d+)$/, '-$1');
  return `https://hashscan.io/testnet/transaction/${formatted}`;
}

function hashscanTopic(topicId: string): string {
  return `https://hashscan.io/testnet/topic/${topicId}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TagBadge({ tag, accentColour }: { tag: string; accentColour: string }) {
  const colours: Record<string, string> = {
    REQUEST: '#22d3ee', OFFER: accentColour, COUNTER: '#fbbf24', ACCEPT: '#22c55e',
  };
  const c = colours[tag] ?? '#5a5a80';
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', borderRadius: 3,
      fontSize: 8, fontWeight: 800, letterSpacing: '0.06em',
      background: `${c}20`, color: c, border: `1px solid ${c}44`,
      fontFamily: 'monospace', flexShrink: 0,
    }}>
      [{tag}]
    </span>
  );
}

function ChatBubble({ entry, accentColour }: { entry: ChatEntry; accentColour: string }) {
  const isAgent = entry.who === 'agent';
  return (
    <motion.div
      initial={{ opacity: 0, x: isAgent ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAgent ? 'flex-start' : 'flex-end',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 600 }}>{entry.name}</span>
        <TagBadge tag={entry.tag} accentColour={accentColour} />
      </div>
      <div style={{
        maxWidth: '85%',
        background: isAgent ? '#0e1a24' : '#0e1820',
        border: `1px solid ${isAgent ? '#22d3ee22' : accentColour + '22'}`,
        borderRadius: isAgent ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
        padding: '8px 12px',
        fontSize: 11,
        color: '#d4d4e8',
        lineHeight: 1.55,
      }}>
        {entry.text}
      </div>
    </motion.div>
  );
}

function ReceiptRow({ label, value, link, explain }: {
  label: string; value: string; link?: string; explain?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #1a1a3e', padding: '7px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#5a5a80', display: 'flex', alignItems: 'center', gap: 5 }}>
          {label}
          {explain && (
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: '#22d3ee22', border: '1px solid #22d3ee44',
                borderRadius: '50%', width: 14, height: 14, cursor: 'pointer',
                fontSize: 8, color: '#22d3ee', fontWeight: 800, lineHeight: '14px', padding: 0,
              }}
            >?</button>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#e4e4f0', fontFamily: 'monospace', fontWeight: 700 }}>{value}</span>
          {link && (
            <motion.a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ boxShadow: '0 0 0px #22d3ee00' }}
              animate={{ boxShadow: ['0 0 0px #22d3ee00', '0 0 12px #22d3ee88', '0 0 4px #22d3ee44'] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                fontSize: 9, color: '#22d3ee', textDecoration: 'none',
                background: '#22d3ee18', border: '1px solid #22d3ee44',
                padding: '2px 7px', borderRadius: 4, fontWeight: 700,
                display: 'inline-block',
              }}
            >
              Verify on-chain ↗
            </motion.a>
          )}
        </div>
      </div>
      {open && explain && (
        <div style={{ fontSize: 9, color: '#7070a0', marginTop: 5, lineHeight: 1.5 }}>{explain}</div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [activeCase, setActiveCase] = useState<CaseId>('legal');
  const [fastMode, setFastMode] = useState(false);
  const [state, setState] = useState<PageState>(INITIAL_STATE);
  const esRef = useRef<EventSource | null>(null);
  const audioCtx = useRef<ReturnType<typeof initAudio>>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef(0);

  const demo = AGORA_CASES.find((c) => c.id === activeCase)!;

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chat.length]);

  const resetState = useCallback(() => {
    esRef.current?.close();
    setState(INITIAL_STATE);
  }, []);

  const switchTab = useCallback((id: CaseId) => {
    resetState();
    setActiveCase(id);
  }, [resetState]);

  const launch = useCallback(() => {
    if (state.running) return;
    if (!audioCtx.current) audioCtx.current = initAudio();
    playClick(audioCtx.current);
    resetState();

    const es = new EventSource(`/api/marketplace?case=${activeCase}${fastMode ? '&fast=1' : ''}`);
    esRef.current = es;

    setState((prev) => ({ ...prev, running: true }));

    es.onmessage = (e) => {
      const payload = JSON.parse(e.data);

      if (payload.type === 'PROGRESS') {
        const { step, data } = payload as { step: DemoStep; data: Record<string, unknown> | null };

        setState((prev) => {
          const next: Partial<PageState> = { step };

          switch (step) {
            case 'scenario':
              next.hcsMessages = [
                ...(prev.hcsMessages ?? []),
                `REVIEW_REQUEST → topic ${data?.topicId}`,
              ];
              break;

            case 'selection':
              next.selectedExpert = data?.expertId as string ?? null;
              next.hcsMessages = [...prev.hcsMessages, 'EXPERT_EVALUATION published'];
              break;

            case 'negotiating': {
              const msg = data?.msg as ChatMsg | undefined;
              if (msg) {
                const id = ++chatIdRef.current;
                next.chat = [...prev.chat, { ...msg, id }];
                playBlip(audioCtx.current);
              }
              if (typeof data?.index === 'number') {
                next.hcsMessages = [...prev.hcsMessages, `${msg?.tag} published`];
              }
              break;
            }

            case 'escrow':
              next.budget = prev.budget - 10;
              next.hcsMessages = [
                ...prev.hcsMessages,
                `ESCROW_DEPOSIT tx: ${String(data?.txId ?? '').slice(0, 24)}…`,
              ];
              break;

            case 'verdict':
              next.showVerdict = true;
              next.hcsMessages = [...prev.hcsMessages, 'VERDICT published'];
              playChord(audioCtx.current);
              break;

            case 'settlement':
              next.budget = prev.budget - 5;
              next.hcsMessages = [
                ...prev.hcsMessages,
                `SETTLEMENT tx: ${String(data?.settleTxId ?? '').slice(0, 24)}…`,
              ];
              playChaChing(audioCtx.current);
              break;

            case 'reputation':
              next.updatedReviews = demo.experts[0].reviews + demo.reputationDelta;
              next.hcsMessages = [...prev.hcsMessages, 'REPUTATION_UPDATE published'];
              break;
          }

          return { ...prev, ...next };
        });
      }

      if (payload.type === 'COMPLETE') {
        setState((prev) => ({ ...prev, result: payload.result as DemoResult, running: false }));
        es.close();
      }

      if (payload.type === 'ERROR') {
        setState((prev) => ({ ...prev, running: false }));
        es.close();
      }
    };

    es.onerror = () => {
      setState((prev) => ({ ...prev, running: false }));
      es.close();
    };
  }, [activeCase, fastMode, state.running, demo.experts, demo.reputationDelta, resetState]);

  // Cleanup on unmount
  useEffect(() => () => esRef.current?.close(), []);

  const showReceipt =
    state.step === 'settlement' || state.step === 'reputation' || !!state.result;

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      background: '#080810',
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      color: '#e4e4f0',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1a1a3e',
        padding: '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Tabs + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {AGORA_CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => switchTab(c.id)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${activeCase === c.id ? c.accentColour + '66' : '#1a1a3e'}`,
                background: activeCase === c.id ? `${c.accentColour}18` : 'transparent',
                color: activeCase === c.id ? c.accentColour : '#5a5a80',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{c.icon}</span>
              <span>{c.tab}</span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Fast mode toggle */}
          <button
            onClick={() => { playClick(audioCtx.current); setFastMode(f => !f); }}
            style={{
              padding: '5px 12px', borderRadius: 7, fontSize: 10, fontWeight: 700,
              cursor: 'pointer', border: `1px solid ${fastMode ? '#fbbf2466' : '#1a1a3e'}`,
              background: fastMode ? '#fbbf2418' : 'transparent',
              color: fastMode ? '#fbbf24' : '#5a5a80', transition: 'all 0.2s',
            }}
          >
            {fastMode ? '⚡ Fast' : '⚡ Fast'}
          </button>

          {state.running && (
            <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, animation: 'pulse 1.5s ease-in-out infinite' }}>
              ● RUNNING
            </span>
          )}

          {state.result && (
            <button
              onClick={resetState}
              style={{
                padding: '6px 14px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', border: '1px solid #1a1a3e',
                background: 'transparent', color: '#5a5a80',
              }}
            >
              Reset
            </button>
          )}

          <button
            onClick={launch}
            disabled={state.running}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              cursor: state.running ? 'not-allowed' : 'pointer',
              border: `1px solid ${demo.accentColour}88`,
              background: state.running ? '#1a1a3e' : `${demo.accentColour}22`,
              color: state.running ? '#5a5a80' : demo.accentColour,
              transition: 'all 0.2s',
            }}
          >
            {state.running ? 'Running…' : state.result ? 'Run Again' : '▶ AutoPlay'}
          </button>
        </div>

        {/* Progress bar */}
        {state.step !== 'idle' && (
          <div style={{ paddingBottom: 14 }}>
            <ProgressBar step={state.step} accentColour={demo.accentColour} />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '28% 1fr 28%', gap: 0, minHeight: 'calc(100vh - 140px)' }}>

        {/* ── LEFT: Agent panel ─────────────────────────────────────────────── */}
        <div style={{ padding: 16, borderRight: '1px solid #1a1a3e', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AgentPanel demoCase={demo} step={state.step} budget={state.budget} />
        </div>

        {/* ── CENTRE: Chat + Verdict + Receipt ─────────────────────────────── */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

          {/* Idle placeholder */}
          {state.step === 'idle' && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 36 }}>{demo.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: demo.accentColour }}>{demo.scenario.title}</div>
              <div style={{ fontSize: 12, color: '#5a5a80', textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
                {demo.scenario.agentTask}
              </div>
              <button
                onClick={launch}
                style={{
                  padding: '10px 28px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', border: `1px solid ${demo.accentColour}88`,
                  background: `${demo.accentColour}22`, color: demo.accentColour,
                }}
              >
                ▶ Launch Agent
              </button>
            </div>
          )}

          {/* Chat log */}
          {state.chat.length > 0 && (
            <div style={{
              background: '#0a0a18', border: '1px solid #1a1a3e',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>
                NEGOTIATION LOG
              </div>
              {state.chat.map((entry) => (
                <ChatBubble key={entry.id} entry={entry} accentColour={demo.accentColour} />
              ))}
              {state.showTyping && state.step === 'negotiating' && (
                <TypingIndicator colour={demo.accentColour} />
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Escrow card */}
          {(state.step === 'escrow' || state.step === 'reviewing' || state.step === 'verdict'
            || state.step === 'settlement' || state.step === 'reputation' || !!state.result) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#0a0a18', border: '1px solid #fbbf2422',
                borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ fontSize: 28 }}>🔒</div>
              <div>
                <div style={{ fontSize: 9, color: '#fbbf24', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>
                  ESCROW LOCKED
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fbbf24' }}>
                  {demo.escrowAmount}
                </div>
                <div style={{ fontSize: 10, color: '#5a5a80', marginTop: 1 }}>
                  {state.step === 'reviewing' ? 'Expert reviewing…' : 'Held pending verdict'}
                </div>
              </div>
            </motion.div>
          )}

          {/* Verdict card */}
          {state.showVerdict && (
            <VerdictCard verdict={demo.verdict as DemoVerdict} accentColour={demo.accentColour} />
          )}

          {/* Settlement + Receipt */}
          {showReceipt && state.result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#0a0a18',
                border: '1px solid #22c55e22',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <div style={{
                background: '#22c55e18', borderBottom: '1px solid #22c55e22',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>✅</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>Deal Settled</span>
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: 9, color: '#22d3ee', fontWeight: 700, letterSpacing: '0.05em' }}
                >
                  PERMANENTLY ON-CHAIN
                </motion.span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <ReceiptRow
                  label="HCS Topic"
                  value={state.result.topicId}
                  link={hashscanTopic(state.result.topicId)}
                  explain="All negotiation messages were published to this Hedera Consensus Service topic as immutable on-chain records."
                />
                <ReceiptRow
                  label={`Payment to ${demo.experts[0].name}`}
                  value={demo.settlement.expertDisplay}
                  link={state.result.settleTxId !== 'SIMULATED-SETTLE-TX'
                    ? hashscanTx(state.result.settleTxId) : undefined}
                  explain="HBAR transferred from escrow to the expert's Hedera account upon successful verdict delivery."
                />
                <ReceiptRow
                  label="Refund to Agent"
                  value={demo.settlement.refundDisplay}
                  link={state.result.refundTxId !== 'SIMULATED-REFUND-TX'
                    ? hashscanTx(state.result.refundTxId) : undefined}
                  explain="Unused escrow balance returned to the AI agent's account."
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Expert cards + HCS log ────────────────────────────────── */}
        <div style={{ padding: 16, borderLeft: '1px solid #1a1a3e', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
          <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>
            EXPERT REGISTRY
          </div>

          {demo.experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              selected={
                state.step === 'idle' || state.step === 'scenario'
                  || state.step === 'confidence' || state.step === 'discovery'
                  ? expert.isSelected
                  : state.selectedExpert === expert.id
              }
              updatedReviews={
                expert.isSelected && state.step === 'reputation'
                  ? state.updatedReviews
                  : undefined
              }
            />
          ))}

          {/* Director notifications */}
          <DirectorNotifications
            step={state.step}
            expertName={demo.experts[0].name}
            escrowAmount={demo.escrowAmount}
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
