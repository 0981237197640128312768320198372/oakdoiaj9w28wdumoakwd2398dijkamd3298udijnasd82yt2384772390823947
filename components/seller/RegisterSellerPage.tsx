'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowLeft, ArrowRight, Send, Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    store: { name: '', description: '' },
    username: '',
    password: '',
    email: '',
    repeatPassword: '',
    contact: { facebook: '', line: '', instagram: '', whatsapp: '' },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name.startsWith('store.')) {
        const field = name.split('.')[1];
        return { ...prev, store: { ...prev.store, [field]: value } };
      } else if (name.startsWith('contact.')) {
        const field = name.split('.')[1];
        let processedValue = value;

        // Remove prefixes if they exist before processing
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.store.name || !formData.store.description) {
        setError('Please fill in store name and description');
        return;
      }
    } else if (step === 2) {
      if (!formData.username || !formData.password || !formData.repeatPassword || !formData.email) {
        setError('Please fill in all account fields');
        return;
      }
      if (formData.password !== formData.repeatPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.contact.facebook || !formData.contact.line) {
      setError('Please provide Facebook and Line contact information');
      return;
    }
    setIsLoading(true);
    setError(null);

    const payload = {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      contact: {
        facebook: `fb.com/${formData.contact.facebook}`,
        line: `@${formData.contact.line}`,
        instagram: formData.contact.instagram ? `@${formData.contact.instagram}` : '',
        whatsapp: formData.contact.whatsapp,
      },
      store: formData.store,
    };

    try {
      const response = await fetch('/api/v3/seller/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl space-y-8 bg-dark-600 p-8 rounded-2xl border border-dark-400">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 overflow-hidden">
            <Image src={dokmailogosquare} alt="Dokmai Logo" layout="fill" className="rounded-xl" />
          </div>
          <h2 className="text-2xl font-bold text-light-100 flex items-center gap-2">
            <Store size={24} className="text-primary" />
            Create Seller Account
          </h2>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= s
                    ? 'bg-primary text-dark-800'
                    : 'bg-dark-500 text-light-500 border border-dark-400'
                }`}>
                {s}
              </div>
              {s < 3 && (
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
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-light-100 mb-4">Store Information</h3>
              <div>
                <label
                  htmlFor="store.name"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Store Name
                </label>
                <input
                  id="store.name"
                  name="store.name"
                  value={formData.store.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your store name"
                />
              </div>
              <div>
                <label
                  htmlFor="store.description"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Store Description
                </label>
                <textarea
                  id="store.description"
                  name="store.description"
                  value={formData.store.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Describe your store"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-light-100 mb-4">Account Information</h3>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-light-100 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-100 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-100 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label
                  htmlFor="repeatPassword"
                  className="block text-sm font-medium text-light-100 mb-1">
                  Confirm Password
                </label>
                <input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  value={formData.repeatPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          {step === 3 && (
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

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-2 rounded-xl text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded-xl text-sm">
              {success}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-dark-500 text-light-100 rounded-xl hover:bg-dark-400 transition-all duration-300">
                <ArrowLeft size={18} />
                Previous
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-xl transition-all duration-300 ml-auto">
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
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
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
              <LogIn size={16} />
              Already have an account? Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
