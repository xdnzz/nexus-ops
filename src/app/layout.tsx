import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './scrollbar.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nexus Ops | Financial Telemetry Console',
  description: 'Real-time financial telemetry monitoring, fraud detection, and transaction analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-canvas font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
