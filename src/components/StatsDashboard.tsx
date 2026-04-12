'use client';

import { motion } from 'framer-motion';
import type { Deal } from '@/types';

interface StatsDashboardProps {
  deals: Deal[];
  activeAgents: number;
  networkStatus: 'online' | 'offline' | 'connecting';
}

function StatBox({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <motion.div
      key={String(value)}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-center min-w-[80px]"
    >
      <div className={`font-bold ${accent}`} style={{ fontSize: '14px' }}>
        {value}
      </div>
      <div className="text-gray-500 mt-1" style={{ fontSize: '6px' }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function StatsDashboard({ deals, activeAgents, networkStatus }: StatsDashboardProps) {
  const totalHBAR = deals.reduce((sum, d) => sum + d.agreedPrice, 0);

  const statusColor =
    networkStatus === 'online' ? 'text-green-400' :
    networkStatus === 'connecting' ? 'text-yellow-400' :
    'text-red-400';

  const statusDot =
    networkStatus === 'online' ? 'bg-green-400' :
    networkStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
    'bg-red-400';

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <StatBox label="DEALS CLOSED" value={deals.length} accent="text-green-400" />
      <StatBox
        label="HBAR SETTLED"
        value={totalHBAR > 0 ? `${totalHBAR.toLocaleString()}ℏ` : '0ℏ'}
        accent="text-yellow-400"
      />
      <StatBox label="ACTIVE AGENTS" value={activeAgents} accent="text-blue-400" />

      {/* Network status */}
      <div className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-center min-w-[80px]">
        <div className="flex items-center justify-center gap-1">
          <div className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className={`font-bold ${statusColor}`} style={{ fontSize: '8px' }}>
            {networkStatus.toUpperCase()}
          </span>
        </div>
        <div className="text-gray-500 mt-1" style={{ fontSize: '6px' }}>
          TESTNET
        </div>
      </div>
    </div>
  );
}
