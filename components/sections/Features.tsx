'use client';

import {
  FileText,
  Globe,
  Calendar,
  ScanSearch,
} from 'lucide-react';
import React from 'react';

const features = [
  {
    Icon: FileText,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    className: 'lg:col-span-1',
  },
  {
    Icon: ScanSearch,
    name: 'Full text search',
    description: 'Search through all your files in one place.',
    className: 'lg:col-span-2',
  },
  {
    Icon: Globe,
    name: 'Multilingual',
    description: 'Supports 100+ languages and counting.',
    className: 'lg:col-span-2',
  },
  {
    Icon: Calendar,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
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
                gap-6
                transition-all
                duration-300
                hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]
                [box-shadow:0_-20px_80px_-20px_#8b5cf61f_inset]
              `}
            >
              <Icon className="h-16 w-16 text-[#8b5cf6] transition-colors duration-300" />
              <div>
                <h3 className="text-2xl font-semibold text-neutral-300 mb-3">
                  {name}
                </h3>
                <p className="text-neutral-400 text-lg leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 