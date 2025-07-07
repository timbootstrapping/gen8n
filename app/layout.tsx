import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import PosthogInit from '@/components/PosthogInit';
import TermlyCMP from '@/components/TermlyCMP';

const inter = Inter({ subsets: ['latin'] });

// Termly website UUID
const WEBSITE_UUID = '1c8e2424-832f-49d3-9f69-ebc7458d294b';

export const metadata: Metadata = {
  title: 'Gen8n – n8n Workflow Generator',
  description: 'Generate ready-to-use n8n workflows from natural language prompts.',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <TermlyCMP websiteUUID={WEBSITE_UUID} autoBlock={true} />
        <PosthogInit />
        <Header />
        {children}
      </body>
    </html>
  );
} 