import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: ['3 workflows / month', 'Store & view past workflows', 'Bring your own API key'],
    highlight: false
  },
  {
    name: 'Pro',
    price: '$29/mo',
    features: ['Unlimited workflows', 'Priority generation queue', 'Advanced agents (coming soon)'],
    highlight: true
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-10 px-4 sm:px-8 lg:px-20 space-y-12">
      <h2 className="text-center text-3xl font-semibold">Pricing</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map(({ name, price, features, highlight }) => (
          <div
            key={name}
            className={`relative p-8 border rounded-2xl flex flex-col gap-6 ${
              highlight ? 'border-highlight' : 'border-border'
            }`}
          >
            {highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-highlight text-foreground px-3 py-0.5 text-xs rounded-full">Most Popular</span>}
            <h3 className="text-2xl font-semibold">{name}</h3>
            <p className="text-4xl font-bold">{price}</p>
            <ul className="space-y-2 flex-1">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-2 text-gray-300 text-sm">
                  <Check size={16} strokeWidth={1} className="text-highlight" />
                  {feat}
                </li>
              ))}
            </ul>
            <Button intent={highlight ? 'primary' : 'secondary'} size="md">{highlight ? 'Go Pro' : 'Get Started'}</Button>
          </div>
        ))}
      </div>
    </section>
  );
} 