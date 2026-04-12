'use client';

import { SOLIDITY_CODE } from '@/lib/experts';

const ROBOT_GRID: string[][] = [
  ['', '', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '', ''],
  ['', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', ''],
  ['#22d3ee', '#22d3ee', '#fbbf24', '#fbbf24', '#22d3ee', '#22d3ee', '#fbbf24', '#fbbf24', '#22d3ee', '#22d3ee'],
  ['#22d3ee', '#22d3ee', '#fbbf24', '#fbbf24', '#22d3ee', '#22d3ee', '#fbbf24', '#fbbf24', '#22d3ee', '#22d3ee'],
  ['#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee'],
  ['#22d3ee', '#22d3ee', '#22d3ee', '#fbbf24', '#fbbf24', '#fbbf24', '#fbbf24', '#22d3ee', '#22d3ee', '#22d3ee'],
  ['#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee', '#22d3ee'],
  ['', '#22d3ee', '#22d3ee', '', '#22d3ee', '#22d3ee', '', '#22d3ee', '#22d3ee', ''],
  ['', '#22d3ee', '', '', '#22d3ee', '#22d3ee', '', '', '#22d3ee', ''],
  ['', '#22d3ee', '', '', '#22d3ee', '#22d3ee', '', '', '#22d3ee', ''],
];

export function AgentPanel({
  step,
  budget,
  reasoning,
}: {
  step: string;
  budget: number;
  reasoning?: string;
}) {
  const isActive = step !== 'input';
  const budgetColor = budget > 30 ? '#22c55e' : budget > 15 ? '#fbbf24' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Robot sprite + info */}
      <div style={{
        background: '#0e0e1c', border: '1px solid #22d3ee22',
        borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          {/* Pixel sprite */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(10, 6px)',
            gridTemplateRows: 'repeat(10, 6px)', gap: 1,
            flexShrink: 0,
            filter: isActive ? 'drop-shadow(0 0 6px #22d3ee66)' : 'none',
            transition: 'filter 0.5s',
          }}>
            {ROBOT_GRID.flat().map((color, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: 1,
                background: color || 'transparent',
              }} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#22d3ee' }}>CodeAgent</div>
            <div style={{ fontSize: 10, color: '#5a5a80', marginTop: 1 }}>AI Coding Assistant</div>
            <div style={{ fontSize: 9, color: isActive ? '#22c55e' : '#5a5a80', marginTop: 2, fontWeight: 700 }}>
              ● {isActive ? 'ACTIVE' : 'IDLE'}
            </div>
          </div>
        </div>

        {/* Task */}
        <div style={{
          background: '#080810', borderRadius: 6, padding: '8px 10px', marginBottom: 10,
        }}>
          <div style={{ fontSize: 8, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>TASK</div>
          <div style={{ fontSize: 10, color: '#e4e4f0', lineHeight: 1.5 }}>
            Security audit of SimpleToken.sol before mainnet deployment
          </div>
        </div>

        {/* Budget */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>BUDGET REMAINING</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: budgetColor, transition: 'color 0.3s' }}>
            {budget} HBAR
          </span>
        </div>
      </div>

      {/* Solidity code */}
      <div style={{
        background: '#080810', border: '1px solid #1c1c38',
        borderRadius: 10, padding: '12px 14px',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#5a5a80', letterSpacing: '0.08em', marginBottom: 8 }}>
          CONTRACT UNDER REVIEW
        </div>
        <div style={{
          fontSize: 10, color: '#a0aec0', fontFamily: 'monospace',
          lineHeight: 1.7, whiteSpace: 'pre', overflowX: 'auto',
          maxHeight: 180, overflowY: 'auto',
        }}>
          {SOLIDITY_CODE.split('\n').map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#3b82f6', userSelect: 'none', minWidth: 16, textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>
              <span style={{
                color: (i + 1 === 14 || i + 1 === 22) ? '#fbbf24' : '#a0aec0',
              }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      {reasoning && (
        <div style={{
          background: '#080810', border: '1px solid #22d3ee22',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em', marginBottom: 5 }}>
            AGENT REASONING
          </div>
          <div style={{ fontSize: 10, color: '#a0aec0', lineHeight: 1.6, fontFamily: 'monospace' }}>
            {reasoning}
            <span style={{ animation: 'pulse 0.8s ease-in-out infinite', color: '#22d3ee' }}>▌</span>
          </div>
        </div>
      )}
    </div>
  );
}
