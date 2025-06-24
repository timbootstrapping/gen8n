'use client';

import { useEffect, useState } from 'react';
import { getCurrentSession } from './supabaseHelpers';
import { useRouter } from 'next/navigation';
import { checkOnboardingStatus, ensureSettingsRow } from './onboardingHelpers';

export function useProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session, error } = await getCurrentSession();
        if (error || !session) {
          router.push('/login');
        } else {
          setUser(session.user);
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        await ensureSettingsRow(user.id);
        const complete = await checkOnboardingStatus(user.id);
        if (!complete && window.location.pathname !== '/signup') {
          window.location.href = '/signup';
        }
      }
    };
    checkOnboarding();
  }, [user]);

  return { loading, user };
} 