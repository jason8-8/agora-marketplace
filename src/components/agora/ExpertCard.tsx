'use client';

import { ReputationBar } from './ReputationBar';
import type { ExpertProfile } from '@/types/agora';

export function ExpertCard({
  expert,
  selected,
  updatedReviews,
}: {
  expert: ExpertProfile;
  selected: boolean;
  updatedReviews?: number;
}) {
  const avatar = expert.id === 'elena' ? '👩‍💻' : '👨‍💻';
  const reviewCount = updatedReviews ?? expert.reviews;

  return (
    <div style={{
      background: '#0e0e1c',
      border: `1px solid ${selected ? '#22d3ee88' : '#1c1c38'}`,
      borderRadius: 12, padding: '14px 16px',
      opacity: selected ? 1 : 0.45,
      boxShadow: selected ? '0 0 16px #22d3ee22' : 'none',
      transition: 'all 0.4s ease-out',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: selected ? '#22d3ee' : '#e4e4f0' }}>
            {expert.name}
          </div>
          <div style={{ fontSize: 10, color: '#5a5a80', marginTop: 1 }}>{expert.title}</div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#fbbf24',
          background: '#fbbf2418', padding: '3px 8px', borderRadius: 5,
          whiteSpace: 'nowrap',
        }}>
          {expert.rate} HBAR
        </div>
      </div>

      {/* Accuracy */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>ACCURACY</span>
          <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>{expert.accuracy}%</span>
        </div>
        <ReputationBar accuracy={expert.accuracy} animate={selected} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, background: '#14141e', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: '#e4e4f0',
            transition: 'transform 0.3s',
            transform: updatedReviews ? 'scale(1.2)' : 'scale(1)',
          }}>
            {reviewCount}
          </div>
          <div style={{ fontSize: 8, color: '#5a5a80', marginTop: 2 }}>REVIEWS</div>
        </div>
        <div style={{ flex: 1, background: '#14141e', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#e4e4f0' }}>{expert.avgTime}</div>
          <div style={{ fontSize: 8, color: '#5a5a80', marginTop: 2 }}>AVG TIME</div>
        </div>
        <div style={{ flex: 1, background: '#14141e', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#a855f7' }}>{expert.specialty}</div>
          <div style={{ fontSize: 8, color: '#5a5a80', marginTop: 2 }}>SPECIALTY</div>
        </div>
      </div>

      {/* Recent verdicts */}
      <div>
        <div style={{ fontSize: 8, fontWeight: 700, color: '#5a5a80', letterSpacing: '0.06em', marginBottom: 5 }}>
          RECENT VERDICTS
        </div>
        {expert.recentVerdicts.map((v, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 9, color: '#a0aec0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.contract}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, marginLeft: 6, whiteSpace: 'nowrap',
              color: v.decision.includes('Rejected') ? '#ef4444' : '#22c55e',
            }}>
              {v.decision.includes('Rejected') ? '✗' : '✓'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
