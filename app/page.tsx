import dynamic from 'next/dynamic';

// Lazy load motion heavy components client side
const Footer = dynamic(() => import('@/components/layout/Footer'));
const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), { ssr: false });
const Features = dynamic(() => import('@/components/sections/Features'), { ssr: false });
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'));
const Pricing = dynamic(() => import('@/components/sections/Pricing'), { ssr: false });
const FAQ = dynamic(() => import('@/components/sections/FAQ'));
const CtaBanner = dynamic(() => import('@/components/sections/CtaBanner'));

export default function HomePage() {
  return (
    <>
      <main className="flex flex-col">
        <Hero />
        <div className="space-y-16 py-16">
          <HowItWorks />
          <Features />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CtaBanner />
        </div>
      </main>
      <Footer />
    </>
  );
} 