'use client';

import React from 'react';
import { Code, Bot, Download } from 'lucide-react';
import { EvervaultCard } from '@/components/ui/evervault-card';

const steps = [
  {
    icon: <Code />,
    title: 'Describe Your Workflow',
    description: 'Tell us what you want to automate. Add services, steps, triggers.',
  },
  {
    icon: <Bot />,
    title: 'AI Generates',
    description: 'Gen8n analyzes your input and builds the JSON using best practices.',
  },
  {
    icon: <Download />,
    title: 'Import & Run',
    description: 'Copy or download your file, paste into n8n — automation done.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-[#0a0a0a]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-12">
        <h2 className="text-center text-3xl font-semibold">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon, title, description }, index) => {
            const styledIcon = React.cloneElement(icon, {
              className: "w-12 h-12 transition-transform duration-300",
              style: { color: 'inherit' }
            });

            return (
              <div key={index} className="group bg-[#18181b] rounded-2xl p-6 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                <div className="relative w-full max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden">
                  {/* <EvervaultCard> */}
                    <div className="relative flex items-center justify-center w-full h-full bg-[#18181b] rounded-2xl">
                      <div className="absolute w-36 h-36 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#18181b] via-[#18181b_40%] to-transparent blur-md" />
                      <div className="z-10 group-hover:animate-icon-pulse-glow animate-pulse-color !text-[#8b5cf6] transition-none [&>*]:!text-inherit" style={{ 
                        transition: 'none', 
                        animationDuration: '2s',
                        color: '#8b5cf6 !important'
                      }}>
                        {styledIcon}
                      </div>
                    </div>
                  {/* </EvervaultCard> */}
                </div>
                <div>
                  <h3 className="text-xl font-semibold transition-all duration-300 group-hover:text-[#a78bfa] group-hover:[text-shadow:0_0_8px_#8b5cf6]">{title}</h3>
                  <p className="text-gray-400 text-sm mt-2">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 