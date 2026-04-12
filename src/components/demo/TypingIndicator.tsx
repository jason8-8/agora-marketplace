'use client';

export function TypingIndicator({ colour }: { colour: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '8px 12px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colour,
            animation: `typingDot 1s ease-in-out ${i * 0.18}s infinite`,
            opacity: 0.4,
          }}
        />
      ))}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
