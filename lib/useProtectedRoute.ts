'use client';

import { useEffect, useState } from 'react';
import { getCurrentSession } from './supabaseHelpers';
import { useRouter } from 'next/navigation';

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

  return { loading, user };
} 