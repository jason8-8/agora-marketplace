'use client';

import type { AgoraVerdictType } from '@/types/agora';

const SEV_COLOR: Record<string, string> = {
  LOW: '#fbbf24',
  INFO: '#60a5fa',
  CRITICAL: '#ef4444',
  MEDIUM: '#f97316',
};

export function VerdictCard({ verdict }: { verdict: AgoraVerdictType }) {
  return (
    <div style={{
      background: '#0e0e1c', border: '1px solid #22c55e44', borderRadius: 14,
      padding: '18px 22px',
      animation: 'agoraShake 0.5s ease-out, fadeIn 0.3s ease-out',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>✅</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>{verdict.decision}</div>
          <div style={{ fontSize: 10, color: '#5a5a80', marginTop: 2 }}>
            Confidence: <span style={{ color: '#22c55e', fontWeight: 700 }}>{verdict.confidence}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: '#e4e4f0', lineHeight: 1.6, marginBottom: 14 }}>
        {verdict.summary}
      </div>

      {/* Findings */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#5a5a80', letterSpacing: '0.08em', marginBottom: 8 }}>
          FINDINGS
        </div>
        {verdict.findings.map((f, i) => {
          const color = SEV_COLOR[f.severity] ?? '#5a5a80';
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, color,
                background: color + '18', padding: '3px 8px', borderRadius: 4,
                whiteSpace: 'nowrap', marginTop: 1, flexShrink: 0,
              }}>
                Line {f.line} · {f.severity}
              </span>
              <span style={{ fontSize: 11, color: '#e4e4f0', lineHeight: 1.5 }}>{f.text}</span>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div style={{
        fontSize: 11, color: '#a855f7', borderTop: '1px solid #1c1c38',
        paddingTop: 10, lineHeight: 1.5,
      }}>
        💡 {verdict.recommendation}
      </div>
    </div>
  );
}
