'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // If user exists and we're on signup page, show onboarding
      if (user) {
        setShowOnboarding(true);
    }
  };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setShowOnboarding(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
        <p className="text-center text-white">Loading...</p>
      </div>
    );
  }

  // Show onboarding if user is authenticated
  if (showOnboarding && user) {
    return (
      <>
        <OnboardingFlow initialUser={user} />
      </>
    );
  }

  // Show signup form if no user
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e0e] via-[#0e0e0e] to-[#1a0d1f] pointer-events-none" />
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(162,89,255,0.15)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Back to website link */}
      <div className="relative w-full max-w-md mx-auto mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white nav-hover"
        >
          <ArrowLeft size={16} />
          Back to Website
          </Link>
      </div>
      
      {/* Signup form container */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-[#0e0e0e]/80 backdrop-blur-xl border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl shadow-black/50">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
} 