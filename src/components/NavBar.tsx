'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const C = {
  bg: '#080810', border: '#1c1c38', dim: '#5a5a80',
  cyan: '#22d3ee', amber: '#f59e0b', purple: '#a855f7',
};

export function NavBar() {
  const path = usePathname();
  const isMarket = path === '/marketplace';
  const isProof = path === '/proof';
  const isRegister = path === '/register';

  return (
    <nav style={{
      background: C.bg,
      borderBottom: `1px solid ${C.border}`,
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: "-apple-system, 'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginRight: 10 }}>
        <span style={{
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: '0.05em',
          color: '#e4e4f0',
          lineHeight: 1,
        }}>
          <span style={{ color: C.cyan }}>A</span>GORA
        </span>
      </Link>

      {/* Nav links */}
      <Link href="/marketplace" style={{
        textDecoration: 'none',
        padding: '5px 14px',
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 700,
        color: isMarket ? '#fff' : C.dim,
        background: isMarket ? `${C.cyan}22` : 'transparent',
        border: `1px solid ${isMarket ? C.cyan + '66' : C.border}`,
        transition: 'all 0.2s',
      }}>
        Marketplace
      </Link>

      <Link href="/proof" style={{
        textDecoration: 'none',
        padding: '5px 14px',
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 700,
        color: isProof ? '#fff' : C.dim,
        background: isProof ? `${C.cyan}22` : 'transparent',
        border: `1px solid ${isProof ? C.cyan + '66' : C.border}`,
        transition: 'all 0.2s',
      }}>
        Proof ↗
      </Link>

      <Link href="/register" style={{
        textDecoration: 'none',
        padding: '5px 14px',
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 700,
        color: isRegister ? '#000' : C.dim,
        background: isRegister ? C.amber : 'transparent',
        border: `1px solid ${isRegister ? C.amber : C.border}`,
        transition: 'all 0.2s',
      }}>
        Register as Expert
      </Link>

      <div style={{ flex: 1 }} />

      {/* Hedera badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 6,
        background: '#0a0a18',
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
        <span style={{ fontSize: 9, color: C.dim, letterSpacing: '0.07em', fontWeight: 600 }}>HEDERA TESTNET</span>
      </div>
    </nav>
  );
}
