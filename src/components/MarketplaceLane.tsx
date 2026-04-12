'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PixelAgent from './PixelAgent';
import DealCard from './DealCard';
import type { NegotiationState, AgentProfile } from '@/types';

const LANE_STYLES: Record<string, { gradient: string; border: string; label: string; labelColor: string }> = {
  SPEAKERS: {
    gradient: 'from-purple-950/80 to-purple-900/40',
    border: 'border-purple-700',
    label: 'SPEAKERS',
    labelColor: 'text-purple-400',
  },
  TALENT: {
    gradient: 'from-blue-950/80 to-blue-900/40',
    border: 'border-blue-700',
    label: 'TALENT',
    labelColor: 'text-blue-400',
  },
  SPONSORS: {
    gradient: 'from-green-950/80 to-green-900/40',
    border: 'border-green-700',
    label: 'SPONSORS',
    labelColor: 'text-green-400',
  },
};

interface MarketplaceLaneProps {
  state: NegotiationState;
  buyer: AgentProfile;
  seller: AgentProfile;
}

export default function MarketplaceLane({ state, buyer, seller }: MarketplaceLaneProps) {
  const style = LANE_STYLES[state.market];
  const isNegotiating = state.phase !== 'idle' && state.phase !== 'complete';
  const agentPosition = isNegotiating ? 'negotiating' : 'idle';

  const bobDurations: Record<string, number> = { SPEAKERS: 1.6, TALENT: 1.9, SPONSORS: 2.1 };

  return (
    <div
      className={`relative flex items-center justify-between px-6 py-3 bg-gradient-to-r ${style.gradient} border-b ${style.border} scanlines overflow-hidden`}
      style={{ minHeight: '140px' }}
    >
      {/* Deal flash overlay */}
      <AnimatePresence>
        {state.phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-green-500 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Market label */}
      <div className="absolute top-2 left-3">
        <span className={`${style.labelColor} font-bold`} style={{ fontSize: '8px' }}>
          {style.label}
        </span>
        {state.phase !== 'idle' && (
          <span className="text-gray-500 ml-2" style={{ fontSize: '6px' }}>
            {state.phase.toUpperCase()}
            {state.round > 0 && ` · ROUND ${state.round}`}
          </span>
        )}
      </div>

      {/* Buyer (left side) */}
      <div className="flex-shrink-0 pt-4">
        <PixelAgent
          profile={buyer}
          position={agentPosition}
          currentMessage={state.currentBuyerMessage}
          bobDuration={bobDurations[state.market]}
        />
      </div>

      {/* Centre — deal card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <AnimatePresence>
          {state.deal && state.phase === 'complete' && (
            <DealCard key={state.deal.id} deal={state.deal} />
          )}
        </AnimatePresence>

        {/* Negotiating phase indicator */}
        {isNegotiating && !state.deal && (
          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="text-gray-500"
              style={{ fontSize: '7px' }}
            >
              {state.phase === 'listing' && '📋 broadcasting listing...'}
              {state.phase === 'interest' && '🔍 evaluating interest...'}
              {state.phase === 'negotiating' && '💬 negotiating...'}
              {state.phase === 'agreement' && '🤝 agreement reached'}
              {state.phase === 'settlement' && '💰 settling on-chain...'}
              {state.phase === 'rejected' && '✗ no match'}
            </motion.div>
          </div>
        )}
      </div>

      {/* Seller (right side) */}
      <div className="flex-shrink-0 pt-4">
        <PixelAgent
          profile={seller}
          position={agentPosition}
          currentMessage={state.currentSellerMessage}
          bobDuration={bobDurations[state.market] + 0.2}
        />
      </div>
    </div>
  );
}
