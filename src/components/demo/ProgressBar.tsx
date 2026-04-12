'use client';

import type { DemoStep } from '@/types/demo';

const STEPS: { id: DemoStep; label: string }[] = [
  { id: 'scenario', label: 'Scenario' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'selection', label: 'Selection' },
  { id: 'negotiating', label: 'Negotiation' },
  { id: 'escrow', label: 'Escrow' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'verdict', label: 'Verdict' },
  { id: 'settlement', label: 'Settlement' },
  { id: 'reputation', label: 'Reputation' },
];

const STEP_ORDER = STEPS.map((s) => s.id);

export function ProgressBar({ step, accentColour }: { step: DemoStep; accentColour: string }) {
  const currentIdx = STEP_ORDER.indexOf(step);

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {STEPS.map((s, i) => {
        const done = currentIdx >= i;
        const active = currentIdx === i;
        return (
          <div key={s.id} style={{ flex: 1, position: 'relative' }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: done ? accentColour : '#1c1c38',
                boxShadow: active ? `0 0 8px ${accentColour}88` : 'none',
                transition: 'background 0.4s, box-shadow 0.4s',
              }}
            />
            {active && (
              <div style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 8,
                color: accentColour,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
              }}>
                {s.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
