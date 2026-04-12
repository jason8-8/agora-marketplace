'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NegotiationMessage } from '@/types';

const MARKET_COLOR: Record<string, string> = {
  SPEAKERS: 'text-purple-400',
  TALENT: 'text-blue-400',
  SPONSORS: 'text-green-400',
};

const TYPE_COLOR: Record<string, string> = {
  LISTING: 'text-gray-300',
  INTEREST: 'text-yellow-300',
  COUNTER: 'text-orange-300',
  AGREEMENT: 'text-green-300',
  SETTLEMENT: 'text-yellow-400',
  DEAL_NFT: 'text-purple-300',
  REJECTION: 'text-red-400',
};

interface HCSFeedProps {
  messages: NegotiationMessage[];
}

export default function HCSFeed({ messages }: HCSFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const recent = messages.slice(-25);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 bg-gray-950 border-t border-gray-800 z-40">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-1 border-b border-gray-800">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400" style={{ fontSize: '7px' }}>
          LIVE HCS FEED — HEDERA TESTNET
        </span>
        <span className="text-gray-600 ml-auto" style={{ fontSize: '7px' }}>
          {messages.length} messages
        </span>
      </div>

      {/* Scrolling feed */}
      <div className="h-20 overflow-y-auto hcs-scroll px-4 py-1 flex flex-col gap-0.5">
        <AnimatePresence initial={false}>
          {recent.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-baseline gap-2 shrink-0"
            >
              <span className={`${MARKET_COLOR[msg.market]} shrink-0`} style={{ fontSize: '6px' }}>
                [{msg.market.slice(0, 3)}]
              </span>
              <span className={`${TYPE_COLOR[msg.type] ?? 'text-gray-400'} shrink-0`} style={{ fontSize: '6px' }}>
                {msg.type}
              </span>
              <span className="text-gray-500 shrink-0" style={{ fontSize: '6px' }}>
                {msg.from}:
              </span>
              <span className="text-gray-300 truncate" style={{ fontSize: '6px' }}>
                {msg.content.slice(0, 80)}
              </span>
              {msg.price && (
                <span className="text-yellow-400 shrink-0" style={{ fontSize: '6px', fontFamily: 'serif', fontStyle: 'italic' }}>
                  {msg.price}ℏ
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
