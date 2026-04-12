'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StartButtonProps {
  onStart: () => void;
  onForceComplete: () => void;
  isRunning: boolean;
}

export default function StartButton({ onStart, onForceComplete, isRunning }: StartButtonProps) {
  const [pressed, setPressed] = useState(false);

  function handleStart() {
    if (pressed || isRunning) return;
    setPressed(true);
    onStart();
  }

  if (isRunning) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStart}
        disabled={pressed}
        className="px-10 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg border-2 border-green-400 disabled:border-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', letterSpacing: '0.05em' }}
      >
        {pressed ? 'LAUNCHING...' : '▶ LAUNCH MARKETPLACE'}
      </motion.button>

      {/* Hidden-ish Force Complete — small, low contrast, not obvious */}
      <button
        onClick={onForceComplete}
        className="text-gray-700 hover:text-gray-500 transition-colors"
        style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)' }}
      >
        force complete
      </button>
    </div>
  );
}
