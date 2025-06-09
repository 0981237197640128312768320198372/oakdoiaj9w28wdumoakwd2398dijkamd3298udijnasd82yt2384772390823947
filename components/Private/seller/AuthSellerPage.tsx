/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoginSellerPage from './LoginSellerPage';
import RegisterSellerPage from './RegisterSellerPage';

export const AuthSellerPage = () => {
  const [activeView, setActiveView] = useState<'login' | 'register'>('login');

  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-start p-5 gap-5 pt-20">
      <div className="flex overflow-hidden ">
        <button
          type="button"
          onClick={() => setActiveView('login')}
          className={cn(
            'px-4 py-2 text-xs font-medium transition-all rounded-lg duration-300 flex items-center gap-1.5',
            activeView === 'login' ? 'bg-primary text-dark-800' : 'bg-transparent hover:opacity-80'
          )}>
          <LogIn size={14} />
          เข้าสู่ระบบ
        </button>
        <button
          type="button"
          onClick={() => setActiveView('register')}
          className={cn(
            'px-4 py-2 text-xs font-medium transition-all rounded-lg duration-300 flex items-center gap-1.5',
            activeView === 'register'
              ? 'bg-primary text-dark-800'
              : 'bg-transparent hover:opacity-80'
          )}>
          <UserPlus size={14} />
          ลงทะเบียน
        </button>
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
              <LoginSellerPage />
            </motion.div>
          )}

          {activeView === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}>
              <RegisterSellerPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthSellerPage;
