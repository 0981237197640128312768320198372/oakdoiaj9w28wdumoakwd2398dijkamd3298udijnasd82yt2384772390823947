/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { useState } from 'react';
import { User, ArrowLeft, ArrowRight, Send, Loader2, LogIn, Key } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { useClientIP } from '@/hooks/useClientIP';

interface RegisterBuyerPageProps {
  onNavigate: (page: string) => void;
  sellerId: string;
}
export const RegisterBuyerPage: React.FC<RegisterBuyerPageProps> = ({ onNavigate, sellerId }) => {
  const [authMethod, setAuthMethod] = useState<'credentials' | 'personalKey'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const { ipAddress, error: ipError } = useClientIP() || '';

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    repeatPassword: '',
    contact: { facebook: '', line: '', instagram: '', whatsapp: '' },
    storeId: sellerId,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name.startsWith('contact.')) {
        const field = name.split('.')[1];
        let processedValue = value;

        if (field === 'facebook' && value.startsWith('fb.com/')) {
          processedValue = value.replace('fb.com/', '');
        } else if (field === 'line' && value.startsWith('@')) {
          processedValue = value.replace('@', '');
        } else if (field === 'instagram' && value.startsWith('@')) {
          processedValue = value.replace('@', '');
        }

        return { ...prev, contact: { ...prev.contact, [field]: processedValue } };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleAuthMethodChange = (method: 'credentials' | 'personalKey') => {
    setAuthMethod(method);
  };

  const copyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard
        .writeText(generatedKey)
        .then(() => {
          alert('Personal key copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const downloadKey = () => {
    if (generatedKey) {
      const element = document.createElement('a');
      const file = new Blob(
        [
          `Your Dokmai Personal Key: ${generatedKey}\n\nPlease keep this key secure. You will need it to log in to your account.`,
        ],
        { type: 'text/plain' }
      );
      element.href = URL.createObjectURL(file);
      element.download = `dokmai-personal-key-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.email) {
        setError('Name and email are required');
        return;
      }

      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      if (authMethod === 'credentials') {
        if (!formData.username || !formData.password || !formData.repeatPassword) {
          setError('Please fill in all account fields');
          return;
        }
        if (formData.password !== formData.repeatPassword) {
          setError('Passwords do not match');
          return;
        }
      }
      setError(null);
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.contact.facebook || !formData.contact.line) {
      setError('Please provide Facebook and Line contact information');
      return;
    }
    setIsLoading(true);
    setError(null);
    const payload = {
      name: formData.name,
      email: formData.email,
      username: authMethod === 'personalKey' ? undefined : formData.username,
      password: authMethod === 'personalKey' ? undefined : formData.password,
      contact: {
        facebook: `fb.com/${formData.contact.facebook}`,
        line: `@${formData.contact.line}`,
        instagram: formData.contact.instagram ? `@${formData.contact.instagram}` : '',
        whatsapp: formData.contact.whatsapp,
      },
      storeId: sellerId,
      ipAddress,
    };

    console.log(payload);
    try {
      const response = await fetch('/api/v3/buyer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.buyer.personalKey) {
          setGeneratedKey(data.buyer.personalKey);
        }
        setSuccess('Registration successful!');
        if (!data.buyer.personalKey) {
          setTimeout(() => onNavigate('loginbuyer'), 5000);
        }
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl space-y-8 bg-dark-600 p-8 rounded-2xl border border-dark-400">
        {/* Header */}
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
            Create Buyer Account
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= s
                    ? 'bg-primary text-dark-800'
                    : 'bg-dark-500 text-light-500 border border-dark-400'
                }`}>
                {s}
              </div>
              {s < 2 && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                    step > s ? 'bg-primary' : 'bg-dark-400'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <div className="transition-all duration-300">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-light-100 mb-4">Account Information</h3>

              {/* Auth Method Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-light-100">
                  Authentication Method
                </label>
                <div className="flex rounded-xl overflow-hidden border border-dark-400">
                  <button
                    type="button"
                    onClick={() => handleAuthMethodChange('credentials')}
                    className={`flex-1 py-2 flex justify-center items-center gap-2 transition-all duration-300 ${
                      authMethod === 'credentials'
                        ? 'bg-primary text-dark-800 font-medium'
                        : 'bg-dark-600 text-light-500 hover:bg-dark-500'
                    }`}>
                    <LogIn size={16} />
                    Username & Password
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuthMethodChange('personalKey')}
                    className={`flex-1 py-2 flex justify-center items-center gap-2 transition-all duration-300 ${
                      authMethod === 'personalKey'
                        ? 'bg-primary text-dark-800 font-medium'
                        : 'bg-dark-600 text-light-500 hover:bg-dark-500'
                    }`}>
                    <Key size={16} />
                    Personal Key Only
                  </button>
                </div>
                <p className="text-xs text-light-500">
                  {authMethod === 'personalKey'
                    ? 'A unique personal key will be generated for you after registration.'
                    : 'You will log in with your username and password.'}
                </p>
              </div>

              {/* Name field (required for all methods) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-100 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email (required for all methods) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-100 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Username/Password fields (shown for credentials method) */}
              {authMethod === 'credentials' && (
                <>
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-light-100 mb-1">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-light-100 mb-1">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="repeatPassword"
                      className="block text-sm font-medium text-light-100 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="repeatPassword"
                      name="repeatPassword"
                      type="password"
                      value={formData.repeatPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-light-100 mb-4">Contact Information</h3>
              <div>
                <label
                  htmlFor="contact.facebook"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Facebook <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-500">
                    fb.com/
                  </span>
                  <input
                    id="contact.facebook"
                    name="contact.facebook"
                    value={formData.contact.facebook}
                    onChange={handleChange}
                    className="w-full pl-[4.5rem] pr-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    placeholder="your.facebook.profile"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact.line"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Line ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-500">@</span>
                  <input
                    id="contact.line"
                    name="contact.line"
                    value={formData.contact.line}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    placeholder="your.line.id"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact.instagram"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Instagram (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-500">@</span>
                  <input
                    id="contact.instagram"
                    name="contact.instagram"
                    value={formData.contact.instagram}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                    placeholder="your.instagram"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="contact.whatsapp"
                  className="block text-sm font-medium text-light-100 mb-1">
                  WhatsApp (Optional)
                </label>
                <input
                  id="contact.whatsapp"
                  name="contact.whatsapp"
                  value={formData.contact.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          )}

          {/* Generated Key Success Message */}
          {generatedKey && (
            <div className="mt-6 bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Key size={18} />
                Your Personal Key
              </h4>
              <div className="bg-dark-800 p-3 rounded-lg font-mono text-center text-xl tracking-wider relative">
                {generatedKey}
              </div>
              <p className="mt-2 text-sm">
                <span className="text-rose-500 font-medium">IMPORTANT:</span> Save this key in a
                secure location. You will need it to log in to your account.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-2 bg-dark-500 hover:bg-dark-400 text-light-100 py-2 px-4 rounded-xl transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy to Clipboard
                </button>
                <button
                  type="button"
                  onClick={downloadKey}
                  className="flex-1 flex items-center justify-center gap-2 bg-dark-500 hover:bg-dark-400 text-light-100 py-2 px-4 rounded-xl transition-all duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Key
                </button>
              </div>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('loginbuyer')}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm transition-colors duration-300">
                  <LogIn size={16} />
                  Continue to Login
                </button>
              </div>
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && !generatedKey && (
            <div className="mt-4 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-dark-500 text-light-100 rounded-xl hover:bg-dark-400 transition-all duration-300">
                <ArrowLeft size={18} />
                Previous
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-xl transition-all duration-300 ml-auto">
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-xl transition-all duration-300 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Register
                  </>
                )}
              </button>
            )}
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('loginbuyer')}
              className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
              <LogIn size={16} />
              Already have an account? Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
