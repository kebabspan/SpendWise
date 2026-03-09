import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpendWise Frontend',
  description: 'Next.js frontend a NestJS backendhez illesztve',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
