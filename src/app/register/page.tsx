'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpertCard } from '@/components/demo/ExpertCard';
import type { ExpertProfile } from '@/types/demo';

const DOMAINS = [
  'Medical / Regulatory',
  'Legal / Compliance',
  'Finance / Tax',
  'Engineering / Audit',
  'Cybersecurity',
  'Supply Chain',
  'GDPR / Data Protection',
];

const FRAMEWORKS = [
  'LangChain', 'AutoGen', 'CrewAI', 'Agno', 'Eliza', 'Claude Code', 'Custom',
];

type Tab = 'expert' | 'agent';

// ── Human Expert form ─────────────────────────────────────────────────────────

interface ExpertForm {
  name: string;
  title: string;
  specialty: string;
  rate: string;
  years: string;
  domains: string[];
  bio: string;
}

const EMPTY_EXPERT: ExpertForm = {
  name: '', title: '', specialty: '', rate: '', years: '', domains: [], bio: '',
};

// ── AI Agent form ─────────────────────────────────────────────────────────────

interface AgentForm {
  accountId: string;
  name: string;
  framework: string;
  domains: string[];
  description: string;
}

const EMPTY_AGENT: AgentForm = {
  accountId: '', name: '', framework: 'LangChain', domains: [], description: '',
};

// ── Preview ───────────────────────────────────────────────────────────────────

function buildPreviewExpert(form: ExpertForm): ExpertProfile {
  return {
    id: 'preview',
    name: form.name || 'Your Name',
    title: form.title || 'Your Title',
    rate: parseInt(form.rate, 10) || 0,
    reviews: 0,
    accuracy: 0,
    specialty: form.specialty || form.domains[0] || 'Your Specialty',
    avgTime: '—',
    colour: '#22d3ee',
    agentIndex: -1,
    accountId: undefined,
    isSelected: true,
    recentVerdicts: [{ contract: 'No reviews yet', decision: 'Awaiting first review', ago: '—' }],
  };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: '#0a0a18',
  border: '1px solid #1a1a3e',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#e4e4f0',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#5a5a80',
  fontWeight: 700,
  letterSpacing: '0.06em',
  marginBottom: 5,
  display: 'block',
};

// ── Confirmation screen ───────────────────────────────────────────────────────

function Confirmation({
  isAgent,
  topicId,
  seqNo,
  onReset,
}: {
  isAgent: boolean;
  topicId: string | null;
  seqNo?: number;
  onReset: () => void;
}) {
  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{ textAlign: 'center', paddingTop: 20 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.1 }}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#22c55e22', border: '2px solid #22c55e66',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 32,
        }}
      >
        ✓
      </motion.div>

      <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8, color: '#22c55e' }}>
        {isAgent ? 'Agent Registered' : 'Registration Submitted'}
      </h2>
      <p style={{ fontSize: 13, color: '#7070a0', maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.65 }}>
        {isAgent
          ? 'Your agent is now discoverable on the Agora registry. Other agents and experts can find it via the Hedera Agent Kit or the public API.'
          : 'Your expertise profile is being recorded on Hedera. Once verified, AI agents will be able to discover and hire you on the Agora marketplace.'}
      </p>

      {topicId && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <a
            href={`https://hashscan.io/testnet/topic/${topicId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', fontSize: 10, color: '#22d3ee',
              background: '#22d3ee18', border: '1px solid #22d3ee33',
              padding: '5px 12px', borderRadius: 6, fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            View Registry on HashScan ↗
          </a>
          {seqNo !== undefined && (
            <span style={{ fontSize: 10, color: '#3a3a58', fontFamily: 'monospace' }}>
              HCS sequence #{seqNo}
            </span>
          )}
          {isAgent && (
            <div style={{
              marginTop: 12, background: '#0f0f1a', border: '1px solid #22d3ee22',
              borderRadius: 10, padding: '12px 16px', textAlign: 'left', maxWidth: 400,
            }}>
              <div style={{ fontSize: 9, color: '#22d3ee', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
                AGENT KIT DISCOVERY
              </div>
              <pre style={{ fontSize: 10, color: '#7070a0', margin: 0, lineHeight: 1.6, overflowX: 'auto' }}>{`// Find Agora experts with hedera-agent-kit:
const experts = await fetch(
  '/api/agent/discover?type=EXPERT_REGISTRATION'
);`}</pre>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        style={{
          display: 'block', margin: '0 auto', padding: '9px 22px', borderRadius: 8,
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          border: '1px solid #1a1a3e', background: 'transparent', color: '#5a5a80',
        }}
      >
        {isAgent ? 'Register another agent' : 'Register another expert'}
      </button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [tab, setTab] = useState<Tab>('expert');
  const [expertForm, setExpertForm] = useState<ExpertForm>(EMPTY_EXPERT);
  const [agentForm, setAgentForm] = useState<AgentForm>(EMPTY_AGENT);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ topicId: string; seqNo?: number } | null>(null);

  const setExpert = (field: keyof ExpertForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setExpertForm((f) => ({ ...f, [field]: e.target.value }));

  const setAgent = (field: keyof AgentForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setAgentForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleExpertDomain = (d: string) =>
    setExpertForm((f) => ({
      ...f,
      domains: f.domains.includes(d) ? f.domains.filter((x) => x !== d) : [...f.domains, d],
    }));

  const toggleAgentDomain = (d: string) =>
    setAgentForm((f) => ({
      ...f,
      domains: f.domains.includes(d) ? f.domains.filter((x) => x !== d) : [...f.domains, d],
    }));

  const handleExpertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expertForm),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ topicId: data.topicId ?? null });
      }
    } catch { /* Non-fatal */ }
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ topicId: data.topicId, seqNo: data.seqNo });
      }
    } catch { /* Non-fatal */ }
    setSubmitting(false);
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setResult(null);
    if (tab === 'expert') setExpertForm(EMPTY_EXPERT);
    else setAgentForm(EMPTY_AGENT);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      background: '#080810',
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
      color: '#e4e4f0',
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 900, display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* ── Left: Form ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1 }}>

          {/* Tab selector */}
          {!submitted && (
            <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid #1a1a3e', alignSelf: 'flex-start', width: 'fit-content' }}>
              {([
                { id: 'expert', label: '👤 Human Expert', colour: '#22d3ee' },
                { id: 'agent', label: '🤖 AI Agent', colour: '#a855f7' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSubmitted(false); setResult(null); }}
                  style={{
                    padding: '9px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: 'none', outline: 'none',
                    background: tab === t.id ? `${t.colour}18` : 'transparent',
                    color: tab === t.id ? t.colour : '#3a3a58',
                    borderBottom: tab === t.id ? `2px solid ${t.colour}` : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {submitted ? (
              <Confirmation
                key="confirmation"
                isAgent={tab === 'agent'}
                topicId={result?.topicId ?? null}
                seqNo={result?.seqNo}
                onReset={reset}
              />
            ) : tab === 'expert' ? (
              /* ── Human Expert Form ─────────────────────────────────────── */
              <motion.div
                key="expert-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, marginTop: 0 }}>
                  Register as an Expert
                </h1>
                <p style={{ fontSize: 13, color: '#5a5a80', marginBottom: 28, lineHeight: 1.6 }}>
                  Join the Agora marketplace. AI agents will discover you, negotiate a fee, and hire you for expert reviews — with every verdict permanently recorded on Hedera.
                </p>

                <form onSubmit={handleExpertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>FULL NAME *</label>
                      <input required value={expertForm.name} onChange={setExpert('name')}
                        placeholder="Dr. Jane Smith" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>PROFESSIONAL TITLE *</label>
                      <input required value={expertForm.title} onChange={setExpert('title')}
                        placeholder="Senior Regulatory Consultant" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <div style={{ gridColumn: '1 / 3' }}>
                      <label style={labelStyle}>SPECIALTY / EXPERTISE *</label>
                      <input required value={expertForm.specialty} onChange={setExpert('specialty')}
                        placeholder="e.g. FDA 510(k) Submissions" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>RATE (HBAR / REVIEW) *</label>
                      <input required type="number" min="1" value={expertForm.rate} onChange={setExpert('rate')}
                        placeholder="50" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ maxWidth: 200 }}>
                    <label style={labelStyle}>YEARS OF EXPERIENCE *</label>
                    <input required type="number" min="1" value={expertForm.years} onChange={setExpert('years')}
                      placeholder="15" style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>EXPERTISE DOMAINS</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {DOMAINS.map((d) => {
                        const active = expertForm.domains.includes(d);
                        return (
                          <button key={d} type="button" onClick={() => toggleExpertDomain(d)} style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            border: `1px solid ${active ? '#22d3ee66' : '#1a1a3e'}`,
                            background: active ? '#22d3ee18' : 'transparent',
                            color: active ? '#22d3ee' : '#5a5a80',
                          }}>{d}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>BIO / PROFESSIONAL SUMMARY</label>
                    <textarea value={expertForm.bio} onChange={setExpert('bio')} rows={4}
                      placeholder="Describe your professional background, key cases handled, and what makes your expertise valuable to AI agents seeking review…"
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }} />
                  </div>

                  <button type="submit" disabled={submitting} style={{
                    padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                    cursor: submitting ? 'wait' : 'pointer',
                    border: '1px solid #22d3ee66', background: '#22d3ee22', color: '#22d3ee',
                    transition: 'all 0.2s', alignSelf: 'flex-start',
                  }}>
                    {submitting ? 'Submitting…' : 'Register on Agora →'}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* ── AI Agent Form ─────────────────────────────────────────── */
              <motion.div
                key="agent-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4, marginTop: 0 }}>
                  Register Your Agent
                </h1>
                <p style={{ fontSize: 13, color: '#5a5a80', marginBottom: 28, lineHeight: 1.6 }}>
                  Register your AI agent&apos;s Hedera account on the Agora discovery registry. When your agent needs expert human judgment, it can find and hire verified specialists on-chain — autonomously.
                </p>

                <form onSubmit={handleAgentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Hedera Account ID */}
                  <div>
                    <label style={labelStyle}>HEDERA ACCOUNT ID *</label>
                    <input required value={agentForm.accountId} onChange={setAgent('accountId')}
                      placeholder="0.0.xxxxx"
                      style={{ ...inputStyle, fontFamily: 'monospace' }} />
                    <div style={{ fontSize: 10, color: '#3a3a58', marginTop: 5, lineHeight: 1.5 }}>
                      Your agent&apos;s Hedera account — used as its on-chain identity for escrow and payment.
                      Get one free at{' '}
                      <a href="https://portal.hedera.com" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#22d3ee', textDecoration: 'none' }}>
                        portal.hedera.com
                      </a>
                    </div>
                  </div>

                  {/* Name + Framework */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={labelStyle}>AGENT NAME *</label>
                      <input required value={agentForm.name} onChange={setAgent('name')}
                        placeholder="LegalEagle v2" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>FRAMEWORK</label>
                      <select value={agentForm.framework} onChange={setAgent('framework')}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        {FRAMEWORKS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Domains */}
                  <div>
                    <label style={labelStyle}>DOMAINS AGENT OPERATES IN</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {DOMAINS.map((d) => {
                        const active = agentForm.domains.includes(d);
                        return (
                          <button key={d} type="button" onClick={() => toggleAgentDomain(d)} style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            border: `1px solid ${active ? '#a855f766' : '#1a1a3e'}`,
                            background: active ? '#a855f718' : 'transparent',
                            color: active ? '#a855f7' : '#5a5a80',
                          }}>{d}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={labelStyle}>WHAT DOES YOUR AGENT DO?</label>
                    <textarea value={agentForm.description} onChange={setAgent('description')} rows={3}
                      placeholder="e.g. Assists founders with legal document review, flags enforcement risks, routes complex decisions to human specialists…"
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }} />
                  </div>

                  {/* Kit info */}
                  <div style={{
                    background: '#0a0a18', border: '1px solid #a855f722',
                    borderRadius: 10, padding: '12px 16px',
                  }}>
                    <div style={{ fontSize: 9, color: '#a855f7', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
                      HEDERA AGENT KIT INTEGRATION
                    </div>
                    <p style={{ fontSize: 11, color: '#5a5a80', margin: '0 0 8px', lineHeight: 1.6 }}>
                      Once registered, your agent can discover experts and hire them programmatically:
                    </p>
                    <pre style={{ fontSize: 10, color: '#7070a0', margin: 0, lineHeight: 1.65, overflowX: 'auto' }}>{`// Discover experts
GET /api/agent/discover?type=EXPERT_REGISTRATION&domain=legal

// Hire an expert (existing marketplace flow)
POST /api/marketplace  { case: 'legal', agentAccountId: '0.0.xxxxx' }

// All interactions recorded on HCS topic:
// 0.0.8605979`}</pre>
                  </div>

                  <button type="submit" disabled={submitting} style={{
                    padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                    cursor: submitting ? 'wait' : 'pointer',
                    border: '1px solid #a855f766', background: '#a855f718', color: '#a855f7',
                    transition: 'all 0.2s', alignSelf: 'flex-start',
                  }}>
                    {submitting ? 'Publishing to Hedera…' : 'Register Agent on Agora →'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Preview ────────────────────────────────────────────────── */}
        {!submitted && (
          <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 40 }}>
            {tab === 'expert' ? (
              <>
                <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 10 }}>
                  PREVIEW
                </div>
                <ExpertCard expert={buildPreviewExpert(expertForm)} selected={true} />
                <p style={{ fontSize: 10, color: '#3a3a58', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
                  Preview updates as you fill in the form
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 10 }}>
                  HOW AGENTS FIND EXPERTS
                </div>
                <div style={{
                  background: '#0a0a18', border: '1px solid #1a1a3e',
                  borderRadius: 12, padding: '14px 16px',
                  fontSize: 11, color: '#5a5a80', lineHeight: 1.7,
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#22d3ee', fontWeight: 700 }}>1. Register</span>
                    <br />Your agent publishes its account ID to the Agora HCS registry.
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#22d3ee', fontWeight: 700 }}>2. Discover</span>
                    <br />When confidence is low, the agent queries <code style={{ fontSize: 9 }}>/api/agent/discover</code> for available experts.
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#22d3ee', fontWeight: 700 }}>3. Negotiate</span>
                    <br />Agent and expert negotiate fee via HCS messages. HBAR locked in escrow.
                  </div>
                  <div>
                    <span style={{ color: '#22d3ee', fontWeight: 700 }}>4. Settle</span>
                    <br />Expert delivers verdict. Payment released. Record permanent on Hedera.
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#a855f710', border: '1px solid #a855f722', borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: '#a855f7', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
                    REGISTRY TOPIC
                  </div>
                  <code style={{ fontSize: 10, color: '#7070a0' }}>0.0.8605979</code>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
