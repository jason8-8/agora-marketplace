import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Agora | Human Proof of Work | Hedera',
  description: 'AI agents hire human experts. Every verdict recorded permanently on Hedera Consensus Service.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
