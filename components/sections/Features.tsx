'use client';

import AnimatedFeatureGrid from './AnimatedFeatureGrid';

export default function Features() {
  return (
    <section id="features" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-center text-3xl font-semibold mb-12">
          Everything you need to get your workflows done
        </h2>
        <AnimatedFeatureGrid />
      </div>
    </section>
  );
} 