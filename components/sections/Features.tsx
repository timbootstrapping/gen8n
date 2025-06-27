'use client';

import {
  FileText,
  MousePointerClick,
  Key,
  StickyNote,
} from 'lucide-react';
import React from 'react';

const features = [
  {
    Icon: MousePointerClick,
    name: 'No-code Input',
    description: 'Just type what you need. No node dragging. Ever',
    className: 'lg:col-span-1',
  },
  {
    Icon: FileText,
    name: 'Production JSON',
    description: 'Get real, importable n8n JSON files with notes for each node.',
    className: 'lg:col-span-2',
  },
  {
    Icon: Key,
    name: 'Use Your API Keys',
    description: 'Bring your own API keys to bypass the Limits.',
    className: 'lg:col-span-2',
  },
  {
    Icon: StickyNote,
    name: 'Sticky Notes',
    description: 'Every generated workflow includes visual notes for each node.',
    className: 'lg:col-span-1',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-center text-3xl font-semibold mb-12">
          Everything you need to get your workflows done
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 auto-rows-[22rem]">
          {features.map(({ Icon, name, description, className }) => (
            <div
              key={name}
              className={`
                ${className}
                group
                bg-[#18181b] 
                p-8 
                rounded-2xl 
                flex 
                flex-col 
                justify-end
                transition-all
                duration-300
                ease-in-out
                shadow-[0_-20px_80px_-20px_#8b5cf61f_inset]
                hover:shadow-[0_-20px_80px_-20px_#8b5cf61f_inset,_0_0_25px_rgba(139,92,246,0.2)]
              `}
            >
              <Icon className="w-12 h-12 text-[#8b5cf6] transition-colors duration-300 ease-in-out mb-4" />
              <div>
                <h3 className="text-xl font-semibold text-neutral-300 mb-3 transition-all duration-300 ease-in-out group-hover:text-[#a78bfa] group-hover:drop-shadow-[0_0_8px_#8b5cf6]">
                  {name}
                </h3>
                <p className="text-neutral-400 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 