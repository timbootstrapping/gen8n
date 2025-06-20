import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CtaBanner() {
  return (
    <section className="py-16 px-4 sm:px-8 lg:px-20 text-center border-y border-border">
      <h2 className="text-3xl md:text-4xl font-semibold mb-6">Ready to build your first workflow?</h2>
      <Link href="/signup">
        <Button intent="primary" size="lg">Get Started</Button>
      </Link>
    </section>
  );
} 