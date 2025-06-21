'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#faq', label: 'FAQ' }
];

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-20 h-16">
        {/* Logo */}
        <Link href="/" className="nav-hover">
          <img 
            src="/Gen8n Text LogoIcon 360x100 svg.svg" 
            alt="Gen8n Logo" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link 
              key={href} 
              href={href} 
              className="nav-hover"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-sm nav-hover"
          >
            Log in
          </Link>
          <Link href="/signup">
            <Button intent="primary" size="sm" className="hover-unified">Sign up</Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground icon-hover"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border px-4 pb-4 flex flex-col gap-4 bg-background">
          {navLinks.map(({ href, label }) => (
            <Link 
              key={href} 
              href={href} 
              className="nav-hover" 
              onClick={() => setIsMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <Link 
              href="/login" 
              className="text-sm nav-hover" 
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
            <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
              <Button intent="primary" size="sm" className="w-full hover-unified">Sign up</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
} 