/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { LoginBuyer } from './LoginBuyer';
import { RegisterBuyer } from './RegisterBuyer';

interface AuthBuyerPageProps {
  onNavigate: (page: string) => void;
  seller: any;
  theme: ThemeType | null;
}

export const AuthBuyerPage: React.FC<AuthBuyerPageProps> = ({ onNavigate, seller, theme }) => {
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');
  const themeUtils = useThemeUtils(theme);

  const handleInternalNavigate = (page: string) => {
    if (page === 'registerbuyer') {
      setActiveView('register');
    } else if (page === 'loginbuyer') {
      setActiveView('login');
    } else {
      onNavigate(page);
    }
  };

  const sellerId = seller?._id;

  return (
    <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-5 gap-5">
      <div className=" flex flex-col lg:flex-row lg:gap-5 justify-center items-center">
        <div
          className={cn(
            'w-14 h-14 mb-4  relative overflow-hidden shadow-md',
            themeUtils.getButtonRoundednessClass(),
            themeUtils.getComponentShadowClass()
          )}>
          <Image
            src={seller?.store?.logoUrl || '/placeholder.svg?height=56&width=56&query=store+logo'}
            alt={seller?.store?.name || 'Store Logo'}
            width={56}
            height={56}
            className="object-cover"
          />
        </div>

        <div
          className={cn(
            'flex overflow-hidden',
            themeUtils.getButtonRoundednessClass(),
            themeUtils.getCardClass(),
            themeUtils.getPrimaryColorClass('border')
          )}>
          <button
            type="button"
            onClick={() => setActiveView('login')}
            className={cn(
              'px-4 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-1.5',
              activeView === 'login'
                ? themeUtils.getButtonClass()
                : 'bg-transparent hover:opacity-80',
              themeUtils.getPrimaryColorClass('border')
            )}>
            <LogIn size={14} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveView('register')}
            className={cn(
              'px-4 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-1.5',
              activeView === 'register'
                ? themeUtils.getButtonClass()
                : 'bg-transparent hover:opacity-80',
              themeUtils.getPrimaryColorClass('border')
            )}>
            <UserPlus size={14} />
            Register
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {activeView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}>
              <LoginBuyer theme={theme} onNavigate={handleInternalNavigate} />
            </motion.div>
          )}

          {activeView === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}>
              <RegisterBuyer
                theme={theme}
                onNavigate={handleInternalNavigate}
                sellerId={sellerId || ''}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthBuyerPage;
