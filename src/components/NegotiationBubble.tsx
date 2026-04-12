'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NegotiationBubbleProps {
  message: string;
  side: 'left' | 'right';
}

export default function NegotiationBubble({ message, side }: NegotiationBubbleProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(message.slice(0, ++i));
      if (i >= message.length) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      className={`relative max-w-[180px] bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 ${
        side === 'left' ? 'bubble-left' : 'bubble-right'
      }`}
    >
      <p
        className="text-gray-100 leading-relaxed"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}
      >
        {displayed}
        {displayed.length < message.length && (
          <span className="animate-pulse text-green-400">▌</span>
        )}
      </p>
    </motion.div>
  );
}
