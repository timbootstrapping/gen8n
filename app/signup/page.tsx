'use client';

import { useState } from 'react';
import { signUpUser } from '@/lib/supabaseHelpers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await signUpUser(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          router.push('/dashboard');
        } else {
          // User needs to confirm email
          setMessage('Please check your email and click the confirmation link to activate your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 pt-24 space-y-6">
      <h1 className="text-3xl font-bold text-center">Create Account</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
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
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          className="w-full bg-transparent border border-border rounded-2xl px-4 py-2 focus:border-highlight outline-none"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-highlight text-sm">{message}</p>}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-highlight hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
} 