'use client';

import { motion } from 'framer-motion';
import type { Deal } from '@/types';

const MARKET_COLORS: Record<string, string> = {
  SPEAKERS: 'border-purple-500 bg-purple-950/60',
  TALENT: 'border-blue-500 bg-blue-950/60',
  SPONSORS: 'border-green-500 bg-green-950/60',
};

const MARKET_BADGE: Record<string, string> = {
  SPEAKERS: 'bg-purple-700 text-purple-100',
  TALENT: 'bg-blue-700 text-blue-100',
  SPONSORS: 'bg-green-700 text-green-100',
};

function formatTxId(txId: string): string {
  // "0.0.XXXXX@1700000000.000000000" → "0.0.XXXXX-1700000000-000000000"
  return txId.replace('@', '-').replace(/\.(\d{9})$/, '-$1');
}

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const hashscanBase = process.env.NEXT_PUBLIC_HASHSCAN_URL ?? 'https://hashscan.io/testnet';

  return (
    <motion.div
      initial={{ y: -80, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative border-2 rounded-lg p-3 w-full max-w-xs mx-auto deal-glow ${MARKET_COLORS[deal.market]}`}
    >
      {/* Green flash overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-green-400 pointer-events-none"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${MARKET_BADGE[deal.market]}`}
          style={{ fontSize: '7px' }}
        >
          {deal.market}
        </span>
        <span className="text-green-400 font-bold" style={{ fontSize: '8px' }}>
          ✓ DEAL
        </span>
      </div>

      {/* Parties */}
      <div className="flex items-center gap-1 mb-2" style={{ fontSize: '7px' }}>
        <span className="text-gray-300 truncate">{deal.buyerName}</span>
        <span className="text-yellow-400">→</span>
        <span className="text-gray-300 truncate">{deal.sellerName}</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-yellow-400 font-bold" style={{ fontSize: '11px' }}>
          {deal.agreedPrice.toLocaleString()}
        </span>
        <span className="text-yellow-600 italic font-bold" style={{ fontSize: '11px', fontFamily: 'serif' }}>
          ℏ
        </span>
        <span className="text-gray-400" style={{ fontSize: '7px' }}>
          HBAR
        </span>
      </div>

      {/* HashScan links */}
      <div className="flex flex-col gap-1">
        {deal.hbarTxId && !deal.hbarTxId.startsWith('SIMULATED') && !deal.hbarTxId.startsWith('FORCE') && (
          <a
            href={`${hashscanBase}/transaction/${formatTxId(deal.hbarTxId)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline truncate"
            style={{ fontSize: '6px' }}
          >
            ↗ View transfer on HashScan
          </a>
        )}
        {deal.nftTokenId && (
          <a
            href={`${hashscanBase}/token/${deal.nftTokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline truncate"
            style={{ fontSize: '6px' }}
          >
            ↗ View deal NFT on HashScan
          </a>
        )}
        <a
          href={`${hashscanBase}/topic/${deal.hcsTopicId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:text-green-300 underline truncate"
          style={{ fontSize: '6px' }}
        >
          ↗ View HCS negotiation log
        </a>
      </div>
    </motion.div>
  );
}
