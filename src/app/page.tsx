import Link from 'next/link';

const USE_CASES = [
  {
    icon: '⚖️',
    title: 'Founder Agreements',
    problem: 'Your AI drafted the SHA. But will it hold up when your co-founder leaves in month 6?',
    colour: '#f59e0b',
    tag: 'Most common founder mistake',
  },
  {
    icon: '💰',
    title: 'International Expansion',
    problem: 'Your AI mapped every tax treaty. But is your structure safe under current HMRC enforcement?',
    colour: '#4ade80',
    tag: 'Pattern recognition from live cases',
  },
  {
    icon: '🏥',
    title: 'Regulatory Filing',
    problem: "Your AI prepared the 510(k). But which predicate device is FDA actually accepting right now?",
    colour: '#a855f7',
    tag: 'Submission history that AI can\'t read',
  },
  {
    icon: '🔌',
    title: 'Build on Agora',
    colour: '#22d3ee',
    problem: 'Your agent hits a wall. Agora finds the right human — autonomously, in minutes, with the verdict permanently on-chain.',
    tag: 'Open via MCP · /api/mcp',
  },
];

export default function LandingPage() {
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

      {/* Hero */}
      <section style={{
        width: '100%', maxWidth: 760,
        padding: '72px 24px 56px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1, color: '#e4e4f0' }}>
          <span style={{ color: '#22d3ee' }}>A</span>GORA
        </div>

        <p style={{ fontSize: 20, color: '#e4e4f0', fontWeight: 700, lineHeight: 1.4, maxWidth: 560, margin: 0 }}>
          Founders trust AI with everything.
        </p>
        <p style={{ fontSize: 16, color: '#7070a0', lineHeight: 1.55, maxWidth: 540, margin: '-8px 0 0' }}>
          But there are decisions AI cannot make alone — and getting them wrong at the wrong moment costs the company.
          Agora routes those moments to the right human expert, autonomously, in minutes, with every judgment permanently on-chain.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/marketplace" style={{
            padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 800,
            textDecoration: 'none', border: '1px solid #22d3ee88',
            background: '#22d3ee22', color: '#22d3ee',
          }}>
            See it in action →
          </Link>
          <Link href="/register" style={{
            padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 800,
            textDecoration: 'none', border: '1px solid #f59e0b66',
            background: '#f59e0b18', color: '#f59e0b',
          }}>
            Register as Expert
          </Link>
        </div>
      </section>

      {/* The problem */}
      <section style={{ width: '100%', maxWidth: 760, padding: '0 24px 48px' }}>
        <div style={{
          background: '#0f0f1a', border: '1px solid #22d3ee18',
          borderRadius: 16, padding: '28px 32px',
        }}>
          <div style={{ fontSize: 10, color: '#22d3ee', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>
            THE PROBLEM
          </div>
          <p style={{ fontSize: 14, color: '#a0aec0', lineHeight: 1.75, margin: 0 }}>
            Founders today use AI for everything — drafting legal documents, structuring international entities, preparing regulatory submissions. The AI reads every precedent, every guideline, every treaty.
            <br /><br />
            What it cannot do is tell you that <span style={{ color: '#e4e4f0', fontWeight: 600 }}>FDA reviewers rejected that exact predicate device in 4 of the last 6 submissions</span>, or that <span style={{ color: '#e4e4f0', fontWeight: 600 }}>HMRC has been informally applying a new substance bar since Q3</span>. That knowledge lives in humans who have been in the room. It cannot be scraped.
            <br /><br />
            Agora is what happens when the AI agent recognises its own limit and knows exactly who to call.
          </p>
        </div>
      </section>

      {/* Use case cards */}
      <section style={{
        width: '100%', maxWidth: 900,
        padding: '0 24px 64px',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 10, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
          WHERE FOUNDERS HIT THE WALL
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {USE_CASES.map((c) => (
            <div key={c.title} style={{
              background: '#0f0f1a',
              border: `1px solid ${c.colour + '30'}`,
              borderRadius: 12, padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c.colour }}>
                    {c.title}
                  </div>
                  {c.tag && (
                    <span style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.05em',
                      color: '#5a5a80', opacity: 0.8,
                    }}>
                      {c.tag}
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#6070a0', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                {c.problem}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Human Proof of Work */}
      <section style={{ width: '100%', maxWidth: 760, padding: '0 24px 72px' }}>
        <div style={{
          background: '#0f0f1a', border: '1px solid #f59e0b18',
          borderRadius: 16, padding: '28px 32px',
        }}>
          <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>
            HUMAN PROOF OF WORK
          </div>
          <p style={{ fontSize: 14, color: '#a0aec0', lineHeight: 1.75, margin: 0 }}>
            Every verdict the expert delivers is recorded permanently on Hedera Consensus Service. Their reputation is their skin in the game — every good call compounds it, every bad call stays on the record forever. Experts compete on accuracy, not just price.
            <br /><br />
            The founder doesn&apos;t need to evaluate the expert. The on-chain record does it for them.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        width: '100%', borderTop: '1px solid #1a1a3e',
        padding: '16px 24px', display: 'flex', justifyContent: 'center',
        gap: 24, fontSize: 11, color: '#3a3a58',
      }}>
        {['Built on Hedera', 'HBAR micro-payments', 'HCS immutable records'].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </footer>
    </main>
  );
}
