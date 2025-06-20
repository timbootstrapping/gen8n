'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export default function Hero() {
  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-8 lg:px-20 text-center space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl md:text-6xl font-bold max-w-5xl mx-auto"
      >
        Generate production-ready n8n workflows in seconds
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto"
      >
        Describe what you need in plain English and let Gen8n build the JSON for you.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <Link href="/generate">
          <Button intent="primary" size="lg">Start Building</Button>
        </Link>
        <a href="#features">
          <Button intent="secondary" size="lg">See Examples</Button>
        </a>
      </motion.div>
    </section>
  );
} 