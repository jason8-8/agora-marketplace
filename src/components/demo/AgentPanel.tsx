'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { DemoCase, DemoStep } from '@/types/demo';

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

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ animation: 'blink 0.8s ease-in-out infinite', color: '#22d3ee' }}>▌</span>
      )}
    </span>
  );
}

export function AgentPanel({
  demoCase,
  step,
  budget,
}: {
  demoCase: DemoCase;
  step: DemoStep;
  budget: number;
}) {
  const isActive = step !== 'idle';
  const budgetPct = (budget / 60) * 100;
  const budgetColor = budget > 40 ? '#22c55e' : budget > 20 ? '#fbbf24' : '#ef4444';

  const showConfidence = step === 'confidence' || step === 'discovery' || step === 'selection'
    || step === 'negotiating' || step === 'escrow' || step === 'reviewing'
    || step === 'verdict' || step === 'settlement' || step === 'reputation';

  const showReasoning = step === 'selection' || step === 'negotiating' || step === 'escrow'
    || step === 'reviewing' || step === 'verdict' || step === 'settlement' || step === 'reputation';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Agent identity card */}
      <div style={{
        background: '#0e0e1c',
        border: `1px solid ${isActive ? '#22d3ee22' : '#1a1a3e'}`,
        borderRadius: 12,
        padding: '14px 16px',
        transition: 'border-color 0.4s',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <motion.div
            animate={{ y: isActive ? [0, -3, 0] : 0 }}
            transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 6px)',
              gridTemplateRows: 'repeat(10, 6px)',
              gap: 1,
              flexShrink: 0,
              filter: isActive ? 'drop-shadow(0 0 6px #22d3ee66)' : 'none',
              transition: 'filter 0.5s',
            }}
          >
            {ROBOT_GRID.flat().map((color, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: color || 'transparent' }} />
            ))}
          </motion.div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#22d3ee' }}>AI Agent</div>
            <div style={{ fontSize: 10, color: '#5a5a80', marginTop: 1 }}>Autonomous Task Runner</div>
            <div style={{ fontSize: 9, color: isActive ? '#22c55e' : '#5a5a80', marginTop: 2, fontWeight: 700 }}>
              ● {isActive ? 'ACTIVE' : 'IDLE'}
            </div>
          </div>
        </div>

        {/* Task */}
        <div style={{ background: '#080810', borderRadius: 6, padding: '8px 10px', marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
            TASK
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: demoCase.accentColour, marginBottom: 3 }}>
            {demoCase.scenario.title}
          </div>
          <div style={{ fontSize: 10, color: '#a0aec0', lineHeight: 1.5 }}>
            {demoCase.scenario.agentTask}
          </div>
        </div>

        {/* Context lines */}
        <div style={{ background: '#080810', borderRadius: 6, padding: '8px 10px', marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 5 }}>
            CONTEXT
          </div>
          {demoCase.scenario.contextLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ color: '#3b82f6', fontSize: 9 }}>›</span>
              <span style={{ fontSize: 10, color: '#7070a0' }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>HBAR BUDGET</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: budgetColor, transition: 'color 0.3s' }}>
              {budget} ℏ
            </span>
          </div>
          <div style={{ background: '#1c1c38', borderRadius: 4, height: 5 }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: `linear-gradient(90deg, ${budgetColor}66, ${budgetColor})`,
              width: `${Math.max(0, budgetPct)}%`,
              transition: 'width 0.6s ease-out, background 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Confidence check */}
      {showConfidence && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#0e0e1c',
            border: '1px solid #ef444422',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em', marginBottom: 6 }}>
            CONFIDENCE CHECK
          </div>
          <div style={{ fontSize: 10, color: '#a0aec0', marginBottom: 8, lineHeight: 1.5 }}>
            {demoCase.confidence.message}
          </div>
          <div style={{ background: '#1c1c38', borderRadius: 4, height: 6 }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: 'linear-gradient(90deg, #ef444466, #ef4444)',
              width: `${demoCase.confidence.pct}%`,
              transition: 'width 1s ease-out',
            }} />
          </div>
        </motion.div>
      )}

      {/* Agent reasoning */}
      {showReasoning && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#080810',
            border: '1px solid #22d3ee22',
            borderRadius: 10,
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em', marginBottom: 5 }}>
            AGENT REASONING
          </div>
          <div style={{ fontSize: 10, color: '#a0aec0', lineHeight: 1.6, fontFamily: 'monospace' }}>
            <TypingText text={demoCase.agentReasoning} />
          </div>
        </motion.div>
      )}

      <style>{`@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`}</style>
    </div>
  );
}
