import Link from 'next/link';
import { Bell } from 'lucide-react';
import dynamic from 'next/dynamic';

const AccountDropdown = dynamic(() => import('@/components/layout/AccountDropdown'), { ssr: false });

export default function Header() {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-highlight">
          Gen8n
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="hover:text-highlight transition-colors">
            Dashboard
          </Link>
          <Link href="/workflows" className="hover:text-highlight transition-colors">
            Workflows
          </Link>
          <button aria-label="Notifications" className="hover:text-highlight transition-colors">
            <Bell size={20} strokeWidth={1} />
          </button>
          <AccountDropdown />
        </nav>
      </div>
    </header>
  );
} 