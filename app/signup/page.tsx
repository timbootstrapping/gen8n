'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import Link from 'next/link';

export default function SignUpPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 pt-24">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <OnboardingFlow initialUser={user} />
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-highlight hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </>
  );
} 