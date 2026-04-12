'use client';

import { motion, AnimatePresence } from 'framer-motion';
import NegotiationBubble from './NegotiationBubble';
import type { AgentProfile } from '@/types';

interface PixelAgentProps {
  profile: AgentProfile;
  position: 'idle' | 'negotiating';
  currentMessage: string | null;
  bobDuration?: number;
}

function PixelBody({ color }: { color: string }) {
  const dark = color + 'cc';
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Head */}
      <div
        className="w-8 h-8 rounded-sm relative flex items-center justify-center"
        style={{ backgroundColor: color, border: '2px solid rgba(255,255,255,0.2)' }}
      >
        {/* Eyes */}
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-none" />
          <div className="w-1.5 h-1.5 bg-white rounded-none" />
        </div>
      </div>
      {/* Body + Arms row */}
      <div className="flex items-center">
        {/* Left arm */}
        <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: dark }} />
        {/* Body */}
        <div
          className="w-9 h-9 rounded-sm"
          style={{ backgroundColor: dark, border: '2px solid rgba(255,255,255,0.1)' }}
        />
        {/* Right arm */}
        <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: dark }} />
      </div>
      {/* Legs */}
      <div className="flex gap-1">
        <div className="w-3 h-4 rounded-sm" style={{ backgroundColor: color }} />
        <div className="w-3 h-4 rounded-sm" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function PixelAgent({
  profile,
  position,
  currentMessage,
  bobDuration = 1.8,
}: PixelAgentProps) {
  const slideX =
    position === 'negotiating'
      ? profile.role === 'buyer'
        ? 120
        : -120
      : 0;

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Speech bubble above agent */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 z-10">
        <AnimatePresence mode="wait">
          {currentMessage && (
            <NegotiationBubble
              key={currentMessage.slice(0, 20)}
              message={currentMessage}
              side={profile.role === 'buyer' ? 'left' : 'right'}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Agent body — idle bob + slide */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          x: slideX,
        }}
        transition={{
          y: { repeat: Infinity, duration: bobDuration, ease: 'easeInOut' },
          x: { duration: 1.5, ease: 'easeInOut' },
        }}
      >
        <PixelBody color={profile.pixelColor} />
      </motion.div>

      {/* Name label */}
      <p
        className="text-center text-gray-300 leading-tight"
        style={{ fontSize: '6px', maxWidth: '80px', transform: `translateX(${slideX}px)`, transition: 'transform 1.5s ease-in-out' }}
      >
        {profile.name}
      </p>
    </div>
  );
}
