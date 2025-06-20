'use client';

import { useEffect, useRef } from 'react';

export default function HeroStarfield() {
  const starsRef = useRef<HTMLDivElement>(null);
  const stars2Ref = useRef<HTMLDivElement>(null);
  const stars3Ref = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate star patterns for each layer
    const generateStars = (count: number) => {
      let stars = '';
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 2000;
        const y = Math.random() * 2000;
        stars += `${x}px ${y}px #FFF, `;
      }
      return stars.slice(0, -2); // Remove last comma and space
    };

    // Apply star patterns to each layer
    if (starsRef.current) {
      starsRef.current.style.boxShadow = generateStars(300);
    }
    if (stars2Ref.current) {
      stars2Ref.current.style.boxShadow = generateStars(150);
    }
    if (stars3Ref.current) {
      stars3Ref.current.style.boxShadow = generateStars(75);
    }

    // Mouse movement handler with parallax effect
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

        // Apply parallax movement with different intensities for each layer
        if (starsRef.current) {
          starsRef.current.style.transform = `translate3d(${x * 20}px, ${y * 20}px, 0)`;
        }
        if (stars2Ref.current) {
          stars2Ref.current.style.transform = `translate3d(${x * 40}px, ${y * 40}px, 0)`;
        }
        if (stars3Ref.current) {
          stars3Ref.current.style.transform = `translate3d(${x * 60}px, ${y * 60}px, 0)`;
        }
      });
    };

    // Add event listener to hero section only
    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove);
    }

    // Cleanup
    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
      }
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div ref={heroRef} className="hero-starfield">
      {/* Starfield layers */}
      <div
        ref={starsRef}
        className="absolute inset-0 animate-star-slow pointer-events-none"
        style={{
          width: '1px',
          height: '1px',
          borderRadius: '50%',
          willChange: 'transform',
          transition: 'transform 0.2s ease-out'
        }}
      />
      <div
        ref={stars2Ref}
        className="absolute inset-0 animate-star-medium pointer-events-none"
        style={{
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          willChange: 'transform',
          transition: 'transform 0.2s ease-out'
        }}
      />
      <div
        ref={stars3Ref}
        className="absolute inset-0 animate-star-fast pointer-events-none"
        style={{
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          willChange: 'transform',
          transition: 'transform 0.2s ease-out'
        }}
      />
    </div>
  );
} 