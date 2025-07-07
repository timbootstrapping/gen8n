import Link from 'next/link';

export default function Footer() {
  const nav = [
    { href: '#home', label: 'Home' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Signup' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/cookies', label: 'Cookie Policy' },
    { href: '/impressum', label: 'Legal Notice' }
  ];

  return (
    <footer className="py-10 border-t border-border bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="hover-glow">
          <img 
            src="/Gen8n Text LogoIcon 360x100 svg.svg" 
            alt="Gen8n Logo" 
            className="h-8 w-auto"
          />
        </Link>
        <nav className="flex gap-6 flex-wrap text-sm">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-highlight transition-colors duration-300 hover-glow">
              {label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-gray-500">© 2025 Gen8n. All rights reserved.</p>
      </div>
    </footer>
  );
}
