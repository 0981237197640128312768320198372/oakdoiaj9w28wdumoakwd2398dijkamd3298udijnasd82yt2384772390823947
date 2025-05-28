/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { useState } from 'react';
import { User, LogIn, UserPlus, Loader2, Key } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useClientIP } from '@/hooks/useClientIP';

interface LoginBuyerPageProps {
  onNavigate: (page: string) => void;
}

export const LoginBuyerPage: React.FC<LoginBuyerPageProps> = ({ onNavigate }) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'personalKey'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [personalKey, setPersonalKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useBuyerAuth();
  const { ipAddress, country, city, postal, coordinate, error: ipError } = useClientIP();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (authMethod === 'credentials') {
      if ((!username && !email) || !password) {
        setError('Please enter both username/email and password');
        setIsLoading(false);
        return;
      }
    } else {
      if (!personalKey) {
        setError('Please enter your personal key');
        setIsLoading(false);
        return;
      }
    }

    try {
      const credentials =
        authMethod === 'credentials'
          ? { username: username || undefined, email: email || undefined, password }
          : { personalKey };
      const payload = {
        ...credentials,
        ipAddress,
        country,
        city,
        postal,
        coordinate,
      };

      console.log('KAKAKAKAKAKAKAKAKA\n', payload);
      const response = await fetch('/api/v3/buyer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token);
      } else {
        setError(data.message || 'Invalid credentials');
        setError(ipError);
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
            <Image
              src={dokmailogosquare || '/placeholder.svg'}
              alt="Dokmai Logo"
              layout="fill"
              className="rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-bold text-light-100 flex items-center gap-2">
            <User size={24} className="text-primary" />
            Buyer Login
          </h2>
          <p className="text-light-500 text-sm text-center">
            Welcome back! Please login to your buyer account.
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="flex rounded-xl overflow-hidden border border-dark-400">
          <button
            onClick={() => setAuthMethod('credentials')}
            className={`flex-1 py-2 flex justify-center items-center gap-2 transition-all duration-300 ${
              authMethod === 'credentials'
                ? 'bg-primary text-dark-800 font-medium'
                : 'bg-dark-600 text-light-500 hover:bg-dark-500'
            }`}>
            <LogIn size={18} />
            Username/Email
          </button>
          <button
            onClick={() => setAuthMethod('personalKey')}
            className={`flex-1 py-2 flex justify-center items-center gap-2 transition-all duration-300 ${
              authMethod === 'personalKey'
                ? 'bg-primary text-dark-800 font-medium'
                : 'bg-dark-600 text-light-500 hover:bg-dark-500'
            }`}>
            <Key size={18} />
            Personal Key
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {authMethod === 'credentials' ? (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-light-100 mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username || email}
                    onChange={(e) => {
                      if (e.target.value.includes('@')) {
                        setEmail(e.target.value);
                        setUsername('');
                      } else {
                        setUsername(e.target.value);
                        setEmail('');
                      }
                    }}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your username or email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-light-100 mb-1">
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
              </>
            ) : (
              <div>
                <label
                  htmlFor="personalKey"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Personal Key
                </label>
                <input
                  type="text"
                  id="personalKey"
                  value={personalKey}
                  onChange={(e) => setPersonalKey(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your 10-character personal key"
                  maxLength={10}
                  required
                />
                <p className="mt-1 text-xs text-light-500">
                  Your personal key is a 10-character code provided during registration.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
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
            </button>

            <div className="text-center">
              <button
                onClick={() => onNavigate('registerbuyer')}
                className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
                <UserPlus size={16} />
                Don't have an account? Register here
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
