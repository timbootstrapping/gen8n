'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-20 h-16">
        <Link href="/" className="text-foreground font-bold text-xl tracking-tight">
          Gen8n
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-highlight transition-colors duration-300">
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-6">
            <Link href="/login" className="hover:text-highlight transition-colors duration-300">
              Sign In
            </Link>
            <Link href="/signup">
              <Button intent="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground hover:text-highlight transition-colors duration-300"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border px-4 pb-4 flex flex-col gap-4 bg-background">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-highlight transition-colors duration-300" onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/login" className="hover:text-highlight transition-colors duration-300" onClick={() => setOpen(false)}>
            Sign In
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)}>
            <Button intent="primary" size="sm" className="w-full">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
} 