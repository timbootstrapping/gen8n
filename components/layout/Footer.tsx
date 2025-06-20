import Link from 'next/link';

export default function Footer() {
  const nav = [
    { href: '#home', label: 'Home' },
    { href: '#pricing', label: 'Pricing' },
    { href: '/login', label: 'Login' },
    { href: '/signup', label: 'Signup' }
  ];

  return (
    <footer className="py-10 px-4 sm:px-8 lg:px-20 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 bg-background">
      <Link href="/" className="font-bold text-xl">Gen8n</Link>
      <nav className="flex gap-6 flex-wrap text-sm">
        {nav.map(({ href, label }) => (
          <Link key={href} href={href} className="hover:text-highlight transition-colors duration-300">
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-xs text-gray-500">© 2025 Gen8n. All rights reserved.</p>
    </footer>
  );
}
