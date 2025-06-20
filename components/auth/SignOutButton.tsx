'use client';

import { signOutUser } from '@/lib/supabaseHelpers';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await signOutUser();
    if (!error) {
      router.push('/login');
    }
  };

  return (
    <button onClick={handleSignOut} className="text-sm text-red-500 hover:underline">
      Log Out
    </button>
  );
} 