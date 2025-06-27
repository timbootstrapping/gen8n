'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PixelCanvas } from '@/components/ui/pixel-canvas';

interface PricingPlan {
  name: string;
  price: string;
  subtitle?: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  isFilled: boolean;
  highlight?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Bring your own API key',
      'Full platform access (generate unlimited)',
      'Store & manage past workflows',
    ],
    buttonText: 'Get Started Free',
    buttonLink: '/signup?plan=free',
    isFilled: false,
    highlight: false,
  },
  {
    name: 'Pay as You Go',
    subtitle: 'Starting at $1.15 / credit',
    price: '3 credits free',
    features: [
      'Full platform access',
      'No monthly commitment',
      'Pay only for what you use',
    ],
    buttonText: 'Start with Credits',
    buttonLink: '/signup?plan=payg',
    isFilled: true,
    highlight: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-center text-3xl font-semibold mb-12">Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
} 

const PricingCard = ({ name, price, subtitle, features, buttonText, buttonLink, isFilled, highlight }: PricingPlan) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative bg-[#18181b] rounded-2xl p-8 flex flex-col h-full transition-all duration-300 overflow-hidden ${
        highlight
          ? 'border border-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.2)]'
          : 'border border-[#333] hover:border-[#8b5cf6]'
      } hover:shadow-[0_0_25px_rgba(139,92,246,0.4)]`}
    >
      {highlight && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <span className="bg-[#8b5cf6] text-white text-xs font-semibold px-4 py-1 rounded-full -translate-y-1/2">
            Popular
          </span>
        </div>
      )}

      <PixelCanvas
        className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        colors={["#8b5cf6", "#a78bfa", "#f3e8ff"]}
      />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <h3 className="text-2xl font-semibold">{name}</h3>
          {subtitle && (
            <p className="text-[#a78bfa] mt-1">{subtitle}</p>
          )}
          <p className="text-4xl font-bold mt-4">{price}</p>
          <ul className="mt-6 space-y-3 text-gray-300">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="text-[#8b5cf6]" size={18} strokeWidth={3} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8">
          <Link href={buttonLink}>
            <button
              className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 ${
                isFilled
                  ? 'bg-[#8b5cf6] text-white hover:bg-[#a78bfa]'
                  : 'border-2 border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white'
              }`}
            >
              {buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}; 