'use client';

import { useState } from 'react';
import { signInUser } from '@/lib/supabaseHelpers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signInUser(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sign In</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Log In'}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Need an account?{' '}
          <Link href="/signup" className="text-highlight hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
} 