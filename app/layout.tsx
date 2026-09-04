import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LegalNotice AI - AI Legal Response Generator for Indian SMEs',
  description: 'Generate professional legal notice responses in minutes. Save ₹5,000-₹50,000 per notice. Built for 63 million Indian SMEs.',
  keywords: ['legal notice', 'India', 'SME', 'GST', 'AI legal', 'lawyer alternative', 'Indian business'],
  openGraph: {
    title: 'LegalNotice AI - AI Legal Response Generator',
    description: 'Respond to legal notices in minutes, not days. ₹299 per notice.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}