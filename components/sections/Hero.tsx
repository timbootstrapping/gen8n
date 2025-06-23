'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import HeroStarfield from '@/components/ui/HeroStarfield';

export default function Hero() {
  const scrollToNext = () => {
    const nextSection = document.getElementById('how-it-works') || document.querySelector('main > div');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="hero-section relative h-screen overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at bottom, #121212 0%, #000000 100%)'
      }}
    >
      {/* Localized Starfield Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <HeroStarfield />
      </div>

      {/* Wrapper with radial blur overlay */}
      <div className="hero-wrapper max-w-[1200px] mx-auto px-4 sm:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-white max-w-5xl mx-auto"
          >
            Generate production-ready n8n workflows in seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="text-lg md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Describe what you need in plain English and let Gen8n build the JSON for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="/signup">
              <Button intent="primary" size="lg" className="hero-primary-button">
                Start Building
              </Button>
            </Link>
            <a href="#features">
              <Button intent="secondary" size="lg" className="hero-secondary-button">
                See Examples
              </Button>
            </a>
          </motion.div>

          {/* Mouse Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mouse-scroll-indicator"
            onClick={scrollToNext}
          >
            <div className="mouse">
              <div className="dot"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 