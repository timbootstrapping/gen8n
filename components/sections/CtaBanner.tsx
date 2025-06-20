import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CtaBanner() {
  return (
    <section className="py-16 border-y border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to build your first workflow?</h2>
        <Link href="/signup">
          <Button intent="primary" size="lg" className="hero-primary-button">Get Started</Button>
        </Link>
      </div>
    </section>
  );
} 