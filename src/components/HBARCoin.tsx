'use client';

import { motion } from 'framer-motion';

interface HBARCoinProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  onComplete: () => void;
}

export default function HBARCoin({ fromX, fromY, toX, toY, onComplete }: HBARCoinProps) {
  const midX = (fromX + toX) / 2;
  const midY = Math.min(fromY, toY) - 80;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{ left: fromX, top: fromY }}
      animate={{
        left: [fromX, midX, toX],
        top: [fromY, midY, toY],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.8],
      }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
    >
      <div className="w-9 h-9 rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/50">
        <span className="text-yellow-900 font-bold text-xs" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>
          ℏ
        </span>
      </div>
    </motion.div>
  );
}
