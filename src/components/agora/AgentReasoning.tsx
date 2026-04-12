'use client';

import { useEffect, useState } from 'react';

export function AgentReasoning({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div style={{
      background: '#080810', border: '1px solid #22d3ee22',
      borderRadius: 10, padding: '12px 14px', minHeight: 64,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em', marginBottom: 6 }}>
        AGENT REASONING
      </div>
      <div style={{ fontSize: 11, color: '#a0aec0', lineHeight: 1.6, fontFamily: 'monospace' }}>
        {displayed}
        <span style={{ animation: 'pulse 0.8s ease-in-out infinite', color: '#22d3ee' }}>▌</span>
      </div>
    </div>
  );
}
