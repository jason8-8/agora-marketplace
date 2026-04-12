'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { DemoStep } from '@/types/demo';

interface Notification {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
}

function notificationsForStep(step: DemoStep, expertName: string, escrowAmount: string): Notification[] {
  const all: Partial<Record<DemoStep, Notification>> = {
    scenario: {
      id: 'scan',
      icon: '🤖',
      title: 'AI Agent',
      body: 'Low confidence on this decision. Searching Agora for a specialist…',
      time: 'now',
    },
    selection: {
      id: 'select',
      icon: '🤖',
      title: 'AI Agent',
      body: `Found ${expertName}. Starting negotiation.`,
      time: 'now',
    },
    escrow: {
      id: 'escrow',
      icon: '🔒',
      title: 'Agora',
      body: `${escrowAmount} locked in escrow. Expert is reviewing.`,
      time: 'now',
    },
    verdict: {
      id: 'verdict',
      icon: '📋',
      title: expertName,
      body: 'Verdict delivered. Action required on 3 findings.',
      time: 'now',
    },
    settlement: {
      id: 'settle',
      icon: '✅',
      title: 'Agora',
      body: 'Payment settled. Full audit trail on Hedera.',
      time: 'now',
    },
  };

  const ORDER: DemoStep[] = ['scenario', 'selection', 'escrow', 'verdict', 'settlement'];
  const stepIdx = ORDER.indexOf(step);
  return ORDER
    .filter((s, i) => i <= stepIdx && all[s])
    .map((s) => all[s]!)
    .reverse(); // most recent first
}

export function DirectorNotifications({
  step,
  expertName,
  escrowAmount,
}: {
  step: DemoStep;
  expertName: string;
  escrowAmount: string;
}) {
  const notifications = notificationsForStep(step, expertName, escrowAmount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700, letterSpacing: '0.06em' }}>
        FOUNDER NOTIFICATIONS
      </div>

      {/* Phone frame */}
      <div style={{
        background: '#0a0a18',
        border: '1px solid #1a1a3e',
        borderRadius: 20,
        padding: '14px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12, padding: '0 4px',
        }}>
          <span style={{ fontSize: 9, color: '#5a5a80', fontWeight: 700 }}>9:41</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: '#5a5a80' }}>●●●●</span>
            <span style={{ fontSize: 8, color: '#5a5a80' }}>WiFi</span>
            <span style={{ fontSize: 8, color: '#22c55e' }}>100%</span>
          </div>
        </div>

        {/* Empty state */}
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>🔕</div>
            <div style={{ fontSize: 10, color: '#3a3a58' }}>No notifications yet</div>
            <div style={{ fontSize: 9, color: '#2a2a48', marginTop: 3 }}>
              You'll be notified when the agent needs attention
            </div>
          </div>
        )}

        {/* Notification cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  background: '#14141f',
                  border: '1px solid #1e1e36',
                  borderRadius: 12,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.2 }}>{n.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#c4c4d8' }}>{n.title}</span>
                      <span style={{ fontSize: 8, color: '#3a3a58' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#7070a0', margin: 0, lineHeight: 1.45 }}>{n.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Idle overlay hint */}
        {step === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0a0a18dd', borderRadius: 20,
            gap: 8,
          }}>
            <div style={{ fontSize: 24 }}>📱</div>
            <div style={{ fontSize: 10, color: '#3a3a58', textAlign: 'center', maxWidth: 120, lineHeight: 1.5 }}>
              The founder is notified at every step — but never has to act.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
