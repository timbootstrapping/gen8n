import Link from 'next/link';
import { Bell } from 'lucide-react';
import dynamic from 'next/dynamic';

const AccountDropdown = dynamic(() => import('@/components/layout/AccountDropdown'), { ssr: false });

export default function DashboardHeader() {
  return (
    <header className="w-full bg-surface border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex items-center justify-between py-4">
        <Link href="/dashboard" className="nav-hover">
          <img 
            src="/Gen8n Text LogoIcon 360x100 svg.svg" 
            alt="Gen8n Logo" 
            className="h-8 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="nav-hover">
            Dashboard
          </Link>
          <Link href="/workflows" className="nav-hover">
            Workflows
          </Link>
          <button aria-label="Notifications" className="icon-hover">
            <Bell size={20} strokeWidth={1} />
          </button>
          <AccountDropdown />
        </nav>
      </div>
    </header>
  );
} 