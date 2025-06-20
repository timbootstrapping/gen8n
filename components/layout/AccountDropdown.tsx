'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { signOutUser } from '@/lib/supabaseHelpers';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover:text-highlight transition-colors"
        aria-label="Account menu"
      >
        <User size={20} strokeWidth={1} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg z-50"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-3 hover:bg-[#1f1f1f] transition-colors"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} strokeWidth={1} /> Dashboard
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 p-3 hover:bg-[#1f1f1f] transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={16} strokeWidth={1} /> Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 p-3 w-full text-left text-red-500 hover:bg-[#1f1f1f] transition-colors"
            >
              <LogOut size={16} strokeWidth={1} /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 