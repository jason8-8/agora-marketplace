'use client';

const COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: '#ef444420', text: '#f87171', border: '#ef444440' },
  MEDIUM: { bg: '#f59e0b20', text: '#fbbf24', border: '#f59e0b40' },
  LOW: { bg: '#4ade8020', text: '#86efac', border: '#4ade8040' },
  INFO: { bg: '#3b82f620', text: '#93c5fd', border: '#3b82f640' },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const c = COLOURS[severity] ?? COLOURS.INFO;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.07em',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontFamily: 'monospace',
        flexShrink: 0,
      }}
    >
      {severity}
    </span>
  );
}
