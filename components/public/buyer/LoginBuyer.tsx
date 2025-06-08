/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { LogIn, Loader2, Key, Eye, EyeOff, Mail, UserIcon } from 'lucide-react'; // Renamed User to UserIcon
import { motion } from 'framer-motion';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useClientIP } from '@/hooks/useClientIP';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface LoginBuyerProps {
  onNavigate: (page: string) => void;
  theme: ThemeType | null;
}

export const LoginBuyer: React.FC<LoginBuyerProps> = ({ onNavigate, theme }) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'personalKey'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [personalKeyInput, setPersonalKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPersonalKey, setShowPersonalKey] = useState(false);

  const { login } = useBuyerAuth();
  const { ipAddress, country, city, postal, coordinate } = useClientIP();
  const themeUtils = useThemeUtils(theme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    let formValid = true;
    if (authMethod === 'credentials') {
      if ((!username && !email) || !password) {
        setError('โปรดกรอก username หรืออีเมล และรหัสผ่าน');
        formValid = false;
      }
    } else {
      if (!personalKeyInput) {
        setError('โปรดกรอก Personal Key');
        formValid = false;
      } else if (personalKeyInput.length !== 10) {
        setError('ERROR!.');
        formValid = false;
      }
    }

    if (!formValid) {
      setIsLoading(false);
      return;
    }

    try {
      const credentials =
        authMethod === 'credentials'
          ? { username: username || undefined, email: email || undefined, password }
          : { personalKey: personalKeyInput };
      const payload = {
        ...credentials,
        ipAddress,
        country,
        city,
        postal,
        coordinate,
      };

      const response = await fetch('/api/v3/buyer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token);
        setSuccess('เข้าสู่ระบบเรียบร้อย! กำลังเข้าสู่เว็บไซต์...');
        setTimeout(() => onNavigate('buyerdashboard'), 1200);
      } else {
        setError(data.message || 'ข้อมูลไม่ถูกต้อง โปรดลองอีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลากที่ไม่คาดคิด โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setIsLoading(false);
    }
  };

  const isLight = themeUtils.baseTheme === 'light';

  const inputBaseClasses = cn(
    'w-full pl-8 pr-3 py-2 text-xs transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 border',
    isLight ? 'bg-light-100 placeholder-gray-400' : 'bg-dark-600 placeholder-gray-500',
    themeUtils.getComponentRoundednessClass(),
    themeUtils.getPrimaryColorClass('border')
  );

  const iconClasses = 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full">
      <div
        className={cn(
          'w-full max-w-sm mx-auto p-6 backdrop-blur-sm transition-all duration-300',
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getCardClass(),
          themeUtils.getPrimaryColorClass('border')
        )}>
        <div
          className={cn(
            'flex overflow-hidden mb-6 border',
            themeUtils.getButtonRoundednessClass(),
            themeUtils.getCardClass(),
            themeUtils.getCardClass()
          )}>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('credentials');
              setError(null);
              setSuccess(null);
            }}
            className={cn(
              'flex-1 py-2 px-3 flex justify-center items-center gap-1.5 transition-all duration-300 text-xs font-medium hover:opacity-80',
              authMethod === 'credentials' && themeUtils.getButtonClass(),
              themeUtils.getPrimaryColorClass('border')
            )}>
            <UserIcon size={14} />
            ข้อมูลส่วนตัว
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('personalKey');
              setError(null);
              setSuccess(null);
            }}
            className={cn(
              'flex-1 py-2 px-3 flex justify-center items-center gap-1.5 transition-all duration-300 text-xs font-medium hover:opacity-80',
              authMethod === 'personalKey' && themeUtils.getButtonClass(),
              themeUtils.getPrimaryColorClass('border')
            )}>
            <Key size={14} />
            Personal Key
          </button>
        </div>

        {/* Platform Information */}
        <div
          className={cn(
            'mb-6 p-4 border-l-4',
            themeUtils.getComponentRoundednessClass(),
            'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
          )}>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">บัญชีเดียว ใช้ได้ทุกร้าน</p>
              <p className="text-xs">
                บัญชีของคุณสามารถใช้ซื้อสินค้าได้จากทุกร้านค้าบนแพลตฟอร์มของ Dokmai Store
                (ร้านค้าที่มีโดเมน dokmai.store)
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            key={authMethod}
            initial={{ opacity: 0, x: authMethod === 'credentials' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4">
            {authMethod === 'credentials' ? (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="usernameOrEmail" className="block text-xs font-medium">
                    username หรืออีเมล
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      {(username || email).includes('@') ? (
                        <Mail size={14} className={iconClasses} />
                      ) : (
                        <UserIcon size={14} className={iconClasses} />
                      )}
                    </div>
                    <input
                      type="text"
                      id="usernameOrEmail"
                      value={username.toLowerCase() || email.toLowerCase()}
                      onChange={(e) => {
                        if (e.target.value.toLowerCase().includes('@')) {
                          setEmail(e.target.value.toLowerCase());
                          setUsername('');
                        } else {
                          setUsername(e.target.value.toLowerCase());
                          setEmail('');
                        }
                      }}
                      className={inputBaseClasses}
                      placeholder="user@example.com or johndoe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="passwordLogin" className="block text-xs font-medium">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Key size={14} className={iconClasses} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="passwordLogin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputBaseClasses}
                      placeholder="Pas$w0Rd"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor="personalKeyLogin" className="block text-xs font-medium">
                  Personal Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Key size={14} className={iconClasses} />
                  </div>
                  <input
                    type={showPersonalKey ? 'text' : 'password'}
                    id="personalKeyLogin"
                    value={personalKeyInput}
                    onChange={(e) => setPersonalKeyInput(e.target.value)}
                    className={inputBaseClasses}
                    placeholder="AB12CD34EF"
                    maxLength={10}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPersonalKey(!showPersonalKey)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {showPersonalKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">คีย์ 10 ตัวอักษรที่ได้รับขณะลงทะเบียน</p>
              </div>
            )}
          </motion.div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'px-3 py-2 text-xs border-l-4', // Compacted padding
                themeUtils.getComponentRoundednessClass(),
                'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
              )}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'px-3 py-2 text-xs border-l-4',
                themeUtils.getComponentRoundednessClass(),
                'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
              )}>
              {success}
            </motion.div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed', // Compacted focus ring offset
              themeUtils.getButtonRoundednessClass(),
              themeUtils.getButtonClass(),
              themeUtils.getPrimaryColorClass('border')
            )}>
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              <>
                <LogIn size={14} />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
