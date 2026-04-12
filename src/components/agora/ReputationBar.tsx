'use client';

export function ReputationBar({ accuracy, animate }: { accuracy: number; animate?: boolean }) {
  const color = accuracy >= 90 ? '#22c55e' : accuracy >= 80 ? '#84cc16' : '#eab308';
  return (
    <div style={{ background: '#1c1c38', borderRadius: 4, height: 6, overflow: 'hidden', width: '100%' }}>
      <div style={{
        height: '100%', borderRadius: 4,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        width: `${accuracy}%`,
        transition: animate ? 'width 1s ease-out, box-shadow 0.5s' : 'none',
        boxShadow: animate ? `0 0 8px ${color}88` : 'none',
      }} />
    </div>
  );
}
