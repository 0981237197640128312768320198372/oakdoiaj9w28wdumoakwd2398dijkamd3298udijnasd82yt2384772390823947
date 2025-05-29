/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { LoginBuyerPage } from './LoginBuyerPage';
import { RegisterBuyerPage } from './RegisterBuyerPage';

interface AuthBuyerPageProps {
  onNavigate: (page: string) => void;
  sellerId?: string;
  theme: any;
}

export const AuthBuyerPage: React.FC<AuthBuyerPageProps> = ({ onNavigate, sellerId, theme }) => {
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const themeUtils = useThemeUtils(theme);

  // Internal navigation handler for switching between login and register
  const handleInternalNavigate = (page: string) => {
    if (page === 'registerbuyer') {
      setActiveView('register');
    } else if (page === 'loginbuyer') {
      setActiveView('login');
    } else {
      // For other pages, pass to parent navigation
      onNavigate(page);
    }
  };

  return (
    <div className="w-full min-h-[600px] flex flex-col items-center justify-center px-4 py-8">
      {/* Header with Logo and Tabs */}
      <div className="mb-8 flex flex-col items-center">
        {/* Store Logo */}
        <div className="w-16 h-16 mb-6 relative overflow-hidden rounded-full shadow-lg">
          <Image
            src={theme?.store?.logoUrl || '/placeholder.svg?height=64&width=64&query=store logo'}
            alt="Store Logo"
            width={64}
            height={64}
            className="object-cover"
          />
        </div>

        {/* Auth Type Tabs */}
        <div
          className={cn(
            'flex overflow-hidden border shadow-sm',
            themeUtils.getComponentRoundednessClass(),
            themeUtils.getCardClass()
          )}>
          <button
            onClick={() => setActiveView('login')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2',
              activeView === 'login'
                ? themeUtils.getPrimaryColorClass('bg') + ' text-white'
                : 'bg-transparent hover:opacity-80'
            )}>
            <LogIn size={16} />
            Sign In
          </button>
          <button
            onClick={() => setActiveView('register')}
            className={cn(
              'px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2',
              activeView === 'register'
                ? themeUtils.getPrimaryColorClass('bg') + ' text-white'
                : 'bg-transparent hover:opacity-80'
            )}>
            <UserPlus size={16} />
            Register
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {activeView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}>
              <LoginBuyerPage onNavigate={handleInternalNavigate} />
            </motion.div>
          )}

          {activeView === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>
              <RegisterBuyerPage onNavigate={handleInternalNavigate} sellerId={sellerId || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthBuyerPage;
