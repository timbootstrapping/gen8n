import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gen8n – n8n Workflow Generator',
  description: 'Generate ready-to-use n8n workflows from natural language prompts.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Header />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6">{children}</main>
      </body>
    </html>
  );
} 