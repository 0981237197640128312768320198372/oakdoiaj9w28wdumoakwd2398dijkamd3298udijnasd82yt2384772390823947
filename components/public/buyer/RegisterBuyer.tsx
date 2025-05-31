/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  LogIn,
  Key,
  UserIcon,
  Mail,
  EyeOff,
  Facebook,
  Instagram,
  Phone,
  LineChartIcon as LineIcon,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'; // Renamed User, MessageSquare
import { motion, AnimatePresence } from 'framer-motion';
import { useClientIP } from '@/hooks/useClientIP';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface RegisterBuyerProps {
  onNavigate: (page: string) => void;
  sellerId: string;
  theme: ThemeType | null;
}

export const RegisterBuyer: React.FC<RegisterBuyerProps> = ({
  onNavigate,
  sellerId,
  theme,
}): ReactElement => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'personalKey'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { ipAddress, country, city, postal, coordinate } = useClientIP();
  const themeUtils = useThemeUtils(theme);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    repeatPassword: '',
    contact: { facebook: '', line: '', instagram: '', whatsapp: '' },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError(null);
    setFormData((prev) => {
      if (name.startsWith('contact.')) {
        const field = name.split('.')[1];
        return { ...prev, contact: { ...prev.contact, [field]: value } };
      }
      return { ...prev, [name]: value };
    });
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard
        .writeText(generatedKey)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch((err) => {
          console.error('Failed to copy personal key: ', err);
          setError('Could not copy key.');
        });
    }
  };

  const downloadKey = () => {
    if (generatedKey) {
      const element = document.createElement('a');
      const file = new Blob(
        [`Personal Key ของคุณ: ${generatedKey}\n\nโปรดเก็บไว้อย่างปลอดภัยสำหรับเข้าสู่ระบบ`],
        {
          type: 'text/plain',
        }
      );
      element.href = URL.createObjectURL(file);
      element.download = `personal-key-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('จำเป็นต้องกรอกชื่อ-นามสกุล และอีเมล');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('โปรดกรอกอีเมลที่ถูกต้อง');
      return false;
    }
    if (authMethod === 'credentials') {
      if (!formData.username.trim() || !formData.password || !formData.repeatPassword) {
        setError('Username and password fields are required.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('จำเป็นต้องกรอก username และรหัสผ่าน');
        return false;
      }
      if (formData.password !== formData.repeatPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.contact.facebook.trim() || !formData.contact.line.trim()) {
      setError('จำเป็นต้องกรอก Facebook username และ Line ID');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setError(null);
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      username: authMethod === 'personalKey' ? undefined : formData.username.trim(),
      password: authMethod === 'personalKey' ? undefined : formData.password,
      contact: {
        facebook: `fb.com/${formData.contact.facebook.trim()}`,
        line: `@${formData.contact.line.trim()}`,
        instagram: formData.contact.instagram.trim() ? `@${formData.contact.instagram.trim()}` : '',
        whatsapp: formData.contact.whatsapp.trim(),
      },
      storeId: sellerId,
      ipAddress,
      country,
      city,
      postal,
      coordinate, // Include all IP details
    };

    try {
      const response = await fetch('/api/v3/buyer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.buyer.personalKey) setGeneratedKey(data.buyer.personalKey);
        setSuccess('การลงทะเบียนสำเร็จ');
        if (!data.buyer.personalKey) setTimeout(() => onNavigate('loginbuyer'), 2000);
      } else {
        setError(data.message || 'การลงทะเบียนไม่สำเร็จ โปรดลองอีกครั้ง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลากที่ไม่คาดคิด โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setError(null);
    setStep(1);
  };

  const isLight = themeUtils.baseTheme === 'light';
  const inputBaseClasses = cn(
    'w-full pl-8 pr-3 py-2 text-xs transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-offset-0 border',
    isLight ? 'bg-light-100 placeholder-gray-400' : 'bg-dark-600 placeholder-gray-500',
    themeUtils.getComponentRoundednessClass(),
    themeUtils.getPrimaryColorClass('border')
  );
  const iconClasses = 'text-gray-400';
  const buttonBaseClasses = cn(
    'flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed',
    themeUtils.getButtonRoundednessClass()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full">
      <div
        className={cn(
          'w-full max-w-lg mx-auto p-6 backdrop-blur-sm border transition-all duration-300',
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getCardClass(),
          themeUtils.getPrimaryColorClass('border')
        )}>
        {!generatedKey ? (
          <>
            <div className="flex justify-center items-center gap-3 mb-6">
              {[1, 2].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={cn(
                      'w-7 h-7 text-xs rounded-full flex items-center justify-center transition-all duration-300 font-semibold',
                      step >= s
                        ? themeUtils.getPrimaryColorClass('bg') + ' text-white'
                        : themeUtils.getCardClass() + ' border'
                    )}>
                    {step > s ? <CheckCircle size={14} /> : s}
                  </div>
                  {s < 2 && (
                    <div
                      className={cn(
                        'w-12 h-px transition-all duration-300',
                        step > s
                          ? themeUtils.getPrimaryColorClass('bg')
                          : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1-register"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">ตั้งค่าบัญชี</h3>
                    <p className="text-xs text-gray-500">ป้อนข้อมูลพื้นฐานบัญชีของคุณ</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium">วิธีการเข้าสู่ระบบ</label>
                    <div
                      className={cn(
                        'flex overflow-hidden ',
                        themeUtils.getButtonRoundednessClass(),
                        themeUtils.getPrimaryColorClass('border'),
                        themeUtils.getCardClass()
                      )}>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('credentials')}
                        className={cn(
                          'flex-1 py-2 px-3 flex justify-center items-center gap-1.5 transition-all duration-300 text-xs font-medium hover:opacity-80',
                          authMethod === 'credentials' && themeUtils.getButtonClass(),
                          themeUtils.getPrimaryColorClass('border')
                        )}>
                        <UserIcon size={14} /> ข้อมูลส่วนตัว
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMethod('personalKey')}
                        className={cn(
                          'flex-1 py-2 px-3 flex justify-center items-center gap-1.5 transition-all duration-300 text-xs font-medium hover:opacity-80',
                          authMethod === 'personalKey' && themeUtils.getButtonClass(),
                          themeUtils.getPrimaryColorClass('border')
                        )}>
                        <Key size={14} /> Personal Key
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="nameRegister" className="block text-xs font-medium">
                        ชื่อ-นามสกุล <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <UserIcon size={14} className={iconClasses} />
                        </div>
                        <input
                          id="nameRegister"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          className={inputBaseClasses}
                          placeholder="Supathom"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="emailRegister" className="block text-xs font-medium">
                        อีเมล <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <Mail size={14} className={iconClasses} />
                        </div>
                        <input
                          id="emailRegister"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={inputBaseClasses}
                          placeholder="supathom@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {authMethod === 'credentials' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="usernameRegister" className="block text-xs font-medium">
                            ชื่อผู้ใช้ <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="usernameRegister"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={cn(inputBaseClasses, 'pl-3')}
                            placeholder="superthom"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="passwordRegister" className="block text-xs font-medium">
                            รหัสผ่าน <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              id="passwordRegister"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleChange}
                              className={cn(inputBaseClasses, 'pl-3 pr-8')}
                              placeholder="Min. 6 characters"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-500">
                              <EyeOff size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="repeatPasswordRegister"
                          className="block text-xs font-medium">
                          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="repeatPasswordRegister"
                          name="repeatPassword"
                          type="password"
                          value={formData.repeatPassword}
                          onChange={handleChange}
                          className={cn(inputBaseClasses, 'pl-3')}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2-register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">ข้อมูลการติดต่อ</h3>
                    <p className="text-xs text-gray-500">ผู้ขายสามารถติดต่อคุณได้อย่างไร?</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: 'facebook',
                        label: 'Facebook Username',
                        icon: Facebook,
                        placeholder: 'your.profile',
                        required: true,
                        prefix: 'fb.com/',
                      },
                      {
                        name: 'line',
                        label: 'Line ID',
                        icon: LineIcon,
                        placeholder: 'your.line.id',
                        required: true,
                        prefix: '@',
                      },
                      {
                        name: 'instagram',
                        label: 'Instagram',
                        icon: Instagram,
                        placeholder: 'your.insta',
                        prefix: '@',
                      },
                      {
                        name: 'whatsapp',
                        label: 'WhatsApp',
                        icon: Phone,
                        placeholder: '+1234567890',
                      },
                    ].map((contactField) => (
                      <div className="space-y-1.5" key={contactField.name}>
                        <label
                          htmlFor={`contact.${contactField.name}`}
                          className="block text-xs font-medium">
                          {contactField.label}
                          {contactField.required && <span className="text-red-500">*</span>}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <contactField.icon size={14} className={iconClasses} />
                          </div>
                          {contactField.prefix && (
                            <span className="absolute inset-y-0 left-8 text-xs text-gray-400 flex items-center pointer-events-none">
                              {contactField.prefix}
                            </span>
                          )}
                          <input
                            id={`contact.${contactField.name}`}
                            name={`contact.${contactField.name}`}
                            value={
                              formData.contact[contactField.name as keyof typeof formData.contact]
                            }
                            onChange={handleChange}
                            className={cn(inputBaseClasses, contactField.prefix ? 'pl-16' : 'pl-8')} // Adjust padding based on prefix
                            placeholder={contactField.placeholder}
                            required={contactField.required}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'mt-4 px-3 py-2 text-xs border-l-4 flex items-center gap-1.5',
                  themeUtils.getComponentRoundednessClass(),
                  'bg-red-50 border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300'
                )}>
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
            {success && !generatedKey && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'mt-4 px-3 py-2 text-xs border-l-4 flex items-center gap-1.5',
                  themeUtils.getComponentRoundednessClass(),
                  'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300'
                )}>
                <CheckCircle size={14} /> {success}
              </motion.div>
            )}

            <div className="flex justify-between items-center mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className={cn(buttonBaseClasses, themeUtils.getCardClass(), 'border px-4')}>
                  <ArrowLeft size={14} /> ก่อนหน้า
                </button>
              ) : (
                <div></div>
              )}
              {step < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={cn(
                    buttonBaseClasses,
                    themeUtils.getButtonClass(),
                    themeUtils.getPrimaryColorClass('border'),
                    'px-4'
                  )}>
                  ถัดไป <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={cn(
                    buttonBaseClasses,
                    themeUtils.getButtonClass(),
                    themeUtils.getPrimaryColorClass('border'),
                    'px-4'
                  )}>
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> กำลังลงทะเบียน...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> สร้างบัญชี
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle size={32} className="text-green-500 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Registration Complete!</h3> f
              <p className="text-xs text-gray-500">Your account is ready.</p>
            </div>
            <div
              className={cn(
                'p-4 border',
                themeUtils.getComponentRoundednessClass(),
                themeUtils.getCardClass()
              )}>
              <h4 className="text-sm font-semibold mb-2 flex items-center justify-center gap-1.5">
                <Key size={16} className={themeUtils.getPrimaryColorClass('text')} /> Your Personal
                Key
              </h4>
              <div
                className={cn(
                  'bg-gray-100 dark:bg-dark-700 p-3 font-mono text-center text-lg tracking-wider border',
                  themeUtils.getComponentRoundednessClass()
                )}>
                {generatedKey}
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="text-red-500 font-semibold">IMPORTANT:</span> Save this key
                securely. You'll need it to log in.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={copyToClipboard}
                className={cn(buttonBaseClasses, themeUtils.getCardClass(), 'border px-3')}>
                {copied ? (
                  <>
                    <CheckCircle size={14} className="text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Key
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={downloadKey}
                className={cn(buttonBaseClasses, themeUtils.getCardClass(), 'border px-3')}>
                <Download size={14} /> Download
              </button>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('loginbuyer')}
              className={cn(buttonBaseClasses, themeUtils.getButtonClass(), 'w-full')}>
              <LogIn size={14} /> Continue to Sign In
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
