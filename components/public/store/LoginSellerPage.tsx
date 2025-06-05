'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerAuth } from '@/context/SellerAuthContext';
import Link from 'next/link';
import { Store, LogIn, UserPlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import ButtonWithLoader from '../../ui/ButtonWithLoader';

export default function LoginSellerPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, seller } = useSellerAuth();

  useEffect(() => {
    if (seller) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      const redirectPath = isDevelopment ? '/seller' : '/';
      router.push(redirectPath);
    }
  }, [seller, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v3/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token);
        router.push('/');
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8 bg-dark-700 p-8 rounded-2xl border border-dark-400">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 overflow-hidden">
            <Image src={dokmailogosquare} alt="Dokmai Logo" layout="fill" className="rounded-xl" />
          </div>
          <h2 className="text-2xl font-bold text-light-100 flex items-center gap-2">
            <Store size={24} className="text-primary" />
            Seller Login
          </h2>
          <p className="text-light-500 text-sm text-center">
            Welcome back! Please login to your seller account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-light-100 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username.toLowerCase()}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-100 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <ButtonWithLoader
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-dark-800 py-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login
                </>
              )}
            </ButtonWithLoader>

            <div className="text-center">
              <Link
                href="/seller/auth/register"
                className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
                <UserPlus size={16} />
                Don't have an account? Register here
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
