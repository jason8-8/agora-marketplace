'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SeverityBadge } from './SeverityBadge';
import type { DemoVerdict } from '@/types/demo';

const DECISION_COLOURS: Record<string, string> = {
  'REVISE BEFORE SUBMISSION': '#f59e0b',
  'RESTRUCTURE': '#ef4444',
  'REVISE THREE DOCUMENTS': '#ef4444',
  'APPROVED': '#22c55e',
  'APPROVED WITH RECOMMENDATIONS': '#4ade80',
};

export function VerdictCard({ verdict, accentColour }: { verdict: DemoVerdict; accentColour: string }) {
  const decisionColour = DECISION_COLOURS[verdict.decision] ?? accentColour;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          background: '#0f0f1a',
          border: `1px solid ${decisionColour}44`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* Decision banner */}
        <div style={{
          background: `${decisionColour}18`,
          borderBottom: `1px solid ${decisionColour}30`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>
              EXPERT VERDICT
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: decisionColour, letterSpacing: '0.03em' }}>
              {verdict.decision}
            </div>
          </div>
          <div style={{
            padding: '4px 10px',
            background: `${decisionColour}22`,
            border: `1px solid ${decisionColour}44`,
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 800,
            color: decisionColour,
          }}>
            {verdict.confidence}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Summary */}
          <p style={{ fontSize: 11, color: '#c4c4d8', lineHeight: 1.6, margin: 0 }}>
            {verdict.summary}
          </p>

          {/* Findings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {verdict.findings.map((finding, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12 }}
                style={{
                  background: '#080810',
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <SeverityBadge severity={finding.severity} />
                <p style={{ fontSize: 10, color: '#a0aec0', lineHeight: 1.6, margin: 0 }}>
                  {finding.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Recommendation */}
          <div style={{
            background: `${decisionColour}10`,
            border: `1px solid ${decisionColour}22`,
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: decisionColour, letterSpacing: '0.06em', marginBottom: 4 }}>
              RECOMMENDATION
            </div>
            <p style={{ fontSize: 10, color: '#c4c4d8', lineHeight: 1.6, margin: 0 }}>
              {verdict.recommendation}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
