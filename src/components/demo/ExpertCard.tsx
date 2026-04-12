'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReputationBar } from './ReputationBar';
import type { ExpertProfile } from '@/types/demo';

// 10×10 human pixel sprite — clothing row uses expert colour
function PixelExpert({ colour }: { colour: string }) {
  // skin = #f5cba7, hair = #4a3728, clothing = colour, legs = #374151
  const S = '#f5cba7'; // skin
  const H = '#4a3728'; // hair
  const C = colour;    // clothing
  const L = '#374151'; // legs
  const _ = '';        // transparent

  const grid = [
    [_, _, _, H, H, H, H, _, _, _],
    [_, _, H, S, S, S, S, H, _, _],
    [_, H, S, S, S, S, S, S, H, _],
    [_, H, S, S, S, S, S, S, H, _],
    [_, _, H, H, H, H, H, H, _, _],
    [_, C, C, C, C, C, C, C, C, _],
    [C, C, C, C, C, C, C, C, C, C],
    [_, C, C, _, _, _, _, C, C, _],
    [_, L, L, _, _, _, _, L, L, _],
    [_, L, L, _, _, _, _, L, L, _],
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(10, 7px)',
      gridTemplateRows: 'repeat(10, 7px)',
      gap: 1,
      flexShrink: 0,
    }}>
      {grid.flat().map((c, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: 1, background: c || 'transparent' }} />
      ))}
    </div>
  );
}

export function ExpertCard({
  expert,
  selected,
  updatedReviews,
}: {
  expert: ExpertProfile;
  selected: boolean;
  updatedReviews?: number;
}) {
  const reviewRef = useRef<HTMLSpanElement>(null);
  const displayReviews = updatedReviews ?? expert.reviews;

  useEffect(() => {
    if (updatedReviews !== undefined && reviewRef.current) {
      reviewRef.current.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', color: expert.colour }, { transform: 'scale(1)' }],
        { duration: 500, easing: 'ease-out' }
      );
    }
  }, [updatedReviews, expert.colour]);

  return (
    <motion.div
      animate={{ opacity: selected ? 1 : 0.4 }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#0f0f1a',
        border: `1px solid ${selected ? expert.colour : '#1a1a3e'}`,
        borderRadius: 12,
        padding: '14px 16px',
        boxShadow: selected ? `0 0 16px ${expert.colour}28` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        cursor: 'default',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <motion.div
          animate={{ filter: selected ? `drop-shadow(0 0 6px ${expert.colour}66)` : 'none' }}
          transition={{ duration: 0.4 }}
        >
          <PixelExpert colour={expert.colour} />
        </motion.div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: selected ? expert.colour : '#e4e4f0', marginBottom: 2 }}>
            {expert.name}
          </div>
          <div style={{ fontSize: 10, color: '#5a5a80', marginBottom: 6 }}>{expert.title}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 4,
              background: `${expert.colour}20`, color: expert.colour,
              border: `1px solid ${expert.colour}40`, fontWeight: 700,
            }}>
              {expert.specialty}
            </span>
          </div>
        </div>
      </div>

      {/* Reputation */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>REPUTATION</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: expert.accuracy >= 90 ? '#22c55e' : '#eab308' }}>
            {expert.accuracy}%
          </span>
        </div>
        <ReputationBar accuracy={expert.accuracy} colour={expert.colour} animate={selected} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
        {[
          { label: 'REVIEWS', value: <span ref={reviewRef}>{displayReviews}</span> },
          { label: 'RATE', value: `${expert.rate} ℏ` },
          { label: 'AVG TIME', value: expert.avgTime },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: '#080810', borderRadius: 6, padding: '6px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 8, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#e4e4f0' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent verdicts */}
      <div>
        <div style={{ fontSize: 8, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6 }}>
          RECENT VERDICTS
        </div>
        {expert.recentVerdicts.map((v, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '4px 0', borderBottom: i < expert.recentVerdicts.length - 1 ? '1px solid #1a1a3e' : 'none',
          }}>
            <span style={{ fontSize: 9, color: '#7070a0', flex: 1 }}>{v.contract}</span>
            <span style={{
              fontSize: 8, fontWeight: 700, marginLeft: 6,
              color: v.decision === 'Approved' ? '#22c55e' : '#f59e0b',
            }}>
              {v.decision}
            </span>
            <span style={{ fontSize: 8, color: '#3a3a58', marginLeft: 6 }}>{v.ago}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
