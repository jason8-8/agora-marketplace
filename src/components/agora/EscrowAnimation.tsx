'use client';

export function EscrowAnimation({ step }: { step: string }) {
  const isEscrow = step === 'escrow' || step === 'reviewing' || step === 'verdict' || step === 'settlement' || step === 'reputation' || step === 'complete';
  const isSettled = step === 'settlement' || step === 'reputation' || step === 'complete';

  return (
    <div style={{
      background: '#080810', border: '1px solid #fbbf2422',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em', marginBottom: 10 }}>
        ESCROW
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '2px solid #fbbf2444',
              background: isEscrow ? `#fbbf24` : 'transparent',
              boxShadow: isEscrow ? '0 0 8px #fbbf2488' : 'none',
              transition: `background ${0.3 + i * 0.15}s ease-out ${i * 0.12}s, box-shadow ${0.3 + i * 0.15}s ease-out ${i * 0.12}s`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
            }}
          >
            {isEscrow ? '₴' : ''}
          </div>
        ))}
      </div>

      <div style={{
        fontSize: 10, textAlign: 'center',
        color: isSettled ? '#22c55e' : isEscrow ? '#fbbf24' : '#5a5a80',
        fontWeight: 700, transition: 'color 0.5s',
      }}>
        {isSettled ? '✓ Settled — 35 HBAR → Elena · 5 HBAR refund'
          : isEscrow ? '40 HBAR locked in escrow'
          : 'Awaiting deposit…'}
      </div>
    </div>
  );
}
