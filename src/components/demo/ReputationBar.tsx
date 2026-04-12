'use client';

export function ReputationBar({
  accuracy,
  colour,
  animate,
}: {
  accuracy: number;
  colour?: string;
  animate?: boolean;
}) {
  const defaultColor =
    accuracy >= 90 ? '#22c55e' : accuracy >= 80 ? '#84cc16' : '#eab308';
  const barColor = colour ?? defaultColor;

  return (
    <div style={{ background: '#1c1c38', borderRadius: 4, height: 7, overflow: 'hidden', width: '100%' }}>
      <div
        style={{
          height: '100%',
          borderRadius: 4,
          background: `linear-gradient(90deg, ${barColor}66, ${barColor})`,
          width: `${accuracy}%`,
          transition: animate ? 'width 1s ease-out, box-shadow 0.5s' : 'none',
          boxShadow: animate ? `0 0 10px ${barColor}88` : 'none',
        }}
      />
    </div>
  );
}
