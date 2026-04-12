'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = [
  { id: '0.0.8605507', label: 'Demo Sessions' },
  { id: '0.0.8605979', label: 'Registry' },
];

const TYPE_META: Record<string, { colour: string; label: string }> = {
  VERDICT:              { colour: '#ef4444', label: 'VERDICT' },
  SETTLEMENT:           { colour: '#22c55e', label: 'SETTLEMENT' },
  ESCROW_DEPOSIT:       { colour: '#fbbf24', label: 'ESCROW' },
  EXPERT_REGISTRATION:  { colour: '#f59e0b', label: 'EXPERT REG' },
  AGENT_REGISTRATION:   { colour: '#22d3ee', label: 'AGENT REG' },
  REVIEW_REQUEST:       { colour: '#ef4444', label: 'REVIEW REQ' },
  REPUTATION_UPDATE:    { colour: '#a855f7', label: 'REPUTATION' },
  REQUEST:              { colour: '#3b82f6', label: 'REQUEST' },
  OFFER:                { colour: '#f59e0b', label: 'OFFER' },
  COUNTER:              { colour: '#fbbf24', label: 'COUNTER' },
  ACCEPT:               { colour: '#22c55e', label: 'ACCEPT' },
  REVIEW_REQUEST_PUBLISHED: { colour: '#a855f7', label: 'REVIEW' },
};

const FILTER_TABS = ['ALL', 'VERDICTS', 'SETTLEMENTS', 'REGISTRATIONS'] as const;
type Filter = typeof FILTER_TABS[number];

interface HCSMessage {
  topicId: string;
  seqNo: number;
  type: string;
  consensusTimestamp: string;
  data: Record<string, unknown>;
  raw: string;
}

function matchesFilter(msg: HCSMessage, filter: Filter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'VERDICTS') return msg.type === 'VERDICT';
  if (filter === 'SETTLEMENTS') return msg.type === 'SETTLEMENT';
  if (filter === 'REGISTRATIONS') return msg.type === 'EXPERT_REGISTRATION' || msg.type === 'AGENT_REGISTRATION';
  return true;
}

function timeAgo(ts: string): string {
  const secs = Math.floor((Date.now() / 1000) - parseFloat(ts));
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function excerptFor(msg: HCSMessage): string {
  const d = msg.data;
  if (d.decision) return String(d.decision);
  if (d.summary) return String(d.summary).slice(0, 80);
  if (d.name) return `${d.name}${d.framework ? ` · ${d.framework}` : ''}`;
  if (d.expert) return `Expert: ${d.expert}`;
  if (d.from && d.content) return `${d.from}: ${String(d.content).slice(0, 60)}`;
  if (d.task) return String(d.task).slice(0, 80);
  return msg.type;
}

function hashscanTopic(topicId: string): string {
  return `https://hashscan.io/testnet/topic/${topicId}`;
}

async function fetchTopicMessages(topicId: string): Promise<HCSMessage[]> {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?limit=50&order=desc`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const raw = await res.json() as { messages?: Array<{ message: string; sequence_number: number; consensus_timestamp: string }> };
  return (raw.messages ?? []).flatMap((m) => {
    try {
      const decoded = Buffer.from(m.message, 'base64').toString('utf8');
      const data = JSON.parse(decoded) as Record<string, unknown>;
      return [{
        topicId,
        seqNo: m.sequence_number,
        type: (data.type as string) ?? 'UNKNOWN',
        consensusTimestamp: m.consensus_timestamp,
        data,
        raw: decoded,
      }];
    } catch {
      return [];
    }
  });
}

export default function ProofPage() {
  const [messages, setMessages] = useState<HCSMessage[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [pulse, setPulse] = useState(false);

  const refresh = useCallback(async () => {
    const all = await Promise.all(TOPICS.map((t) => fetchTopicMessages(t.id)));
    const merged = all.flat().sort((a, b) =>
      parseFloat(b.consensusTimestamp) - parseFloat(a.consensusTimestamp)
    );
    setMessages((prev) => {
      if (prev.length > 0 && merged.length > prev.length) setPulse(true);
      return merged;
    });
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (pulse) {
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, [pulse]);

  const filtered = messages.filter((m) => matchesFilter(m, filter));

  // Stats
  const verdicts = messages.filter((m) => m.type === 'VERDICT').length;
  const settlements = messages.filter((m) => m.type === 'SETTLEMENT').length;
  const registrations = messages.filter((m) =>
    m.type === 'EXPERT_REGISTRATION' || m.type === 'AGENT_REGISTRATION'
  ).length;

  return (
    <main style={{
      minHeight: 'calc(100vh - 52px)',
      background: '#080810',
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      color: '#e4e4f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>

      {/* Header */}
      <section style={{ width: '100%', maxWidth: 860, padding: '48px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
          HUMAN PROOF OF WORK
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 10px', lineHeight: 1.2 }}>
          Every expert judgment.<br />
          <span style={{ color: '#22d3ee' }}>Permanently on Hedera.</span>
        </h1>
        <p style={{ fontSize: 13, color: '#5a5a80', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
          These are real HCS messages from live Agora sessions — not mock data.
          Each one is an immutable record on Hedera Consensus Service.
        </p>

        {/* Stat bar */}
        <motion.div
          animate={pulse ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: 32,
            marginTop: 28, padding: '16px 32px',
            background: '#0f0f1a', border: '1px solid #1a1a3e', borderRadius: 12,
            width: 'fit-content', margin: '28px auto 0',
          }}
        >
          {[
            { label: 'Verdicts on-chain', value: verdicts, colour: '#ef4444' },
            { label: 'Settlements', value: settlements, colour: '#22c55e' },
            { label: 'Registrations', value: registrations, colour: '#a855f7' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.colour, lineHeight: 1 }}>
                {loading ? '—' : s.value}
              </div>
              <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginTop: 4 }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Topics + filter */}
      <section style={{ width: '100%', maxWidth: 860, padding: '0 24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTER_TABS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.05em',
                  border: `1px solid ${filter === f ? '#22d3ee66' : '#1a1a3e'}`,
                  background: filter === f ? '#22d3ee18' : 'transparent',
                  color: filter === f ? '#22d3ee' : '#5a5a80',
                  transition: 'all 0.15s',
                }}
              >{f}</button>
            ))}
          </div>

          {/* Topic links + last refresh */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {TOPICS.map((t) => (
              <a
                key={t.id}
                href={hashscanTopic(t.id)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 9, color: '#3a3a58', textDecoration: 'none',
                  background: '#0f0f1a', border: '1px solid #1a1a3e',
                  padding: '3px 8px', borderRadius: 4, fontFamily: 'monospace',
                  transition: 'color 0.15s',
                }}
              >
                {t.label} {t.id} ↗
              </a>
            ))}
            <span style={{ fontSize: 9, color: '#2a2a48' }}>
              {lastRefresh.toLocaleTimeString()} · auto-refresh 10s
            </span>
          </div>
        </div>
      </section>

      {/* Message feed */}
      <section style={{ width: '100%', maxWidth: 860, padding: '0 24px 64px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#3a3a58', fontSize: 12 }}>
            Reading Hedera Consensus Service…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#3a3a58', fontSize: 12 }}>
            No messages matching this filter yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <AnimatePresence>
              {filtered.map((msg) => {
                const meta = TYPE_META[msg.type] ?? { colour: '#5a5a80', label: msg.type };
                const topicLabel = TOPICS.find((t) => t.id === msg.topicId)?.label ?? msg.topicId;
                return (
                  <motion.div
                    key={`${msg.topicId}-${msg.seqNo}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: '#0f0f1a',
                      border: `1px solid ${meta.colour}22`,
                      borderLeft: `3px solid ${meta.colour}`,
                      borderRadius: 8,
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    {/* Type badge */}
                    <span style={{
                      display: 'inline-block', flexShrink: 0,
                      padding: '2px 7px', borderRadius: 4,
                      fontSize: 8, fontWeight: 800, letterSpacing: '0.06em',
                      background: `${meta.colour}20`, color: meta.colour,
                      border: `1px solid ${meta.colour}44`,
                      fontFamily: 'monospace', minWidth: 72, textAlign: 'center',
                    }}>
                      {meta.label}
                    </span>

                    {/* Excerpt */}
                    <span style={{ flex: 1, fontSize: 12, color: '#a0aec0', lineHeight: 1.4, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {excerptFor(msg)}
                    </span>

                    {/* Meta */}
                    <span style={{ fontSize: 9, color: '#3a3a58', flexShrink: 0, fontFamily: 'monospace' }}>
                      {topicLabel} #{msg.seqNo}
                    </span>
                    <span style={{ fontSize: 9, color: '#3a3a58', flexShrink: 0 }}>
                      {timeAgo(msg.consensusTimestamp)}
                    </span>

                    {/* HashScan link */}
                    <a
                      href={hashscanTopic(msg.topicId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 9, color: '#22d3ee', flexShrink: 0,
                        textDecoration: 'none', background: '#22d3ee14',
                        border: '1px solid #22d3ee33', padding: '2px 7px', borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      ↗
                    </a>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        width: '100%', borderTop: '1px solid #1a1a3e',
        padding: '16px 24px', display: 'flex', justifyContent: 'center',
        gap: 24, fontSize: 11, color: '#3a3a58',
      }}>
        {['Built on Hedera', 'HCS immutable records', 'Auto-refreshes every 10s'].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </footer>
    </main>
  );
}
