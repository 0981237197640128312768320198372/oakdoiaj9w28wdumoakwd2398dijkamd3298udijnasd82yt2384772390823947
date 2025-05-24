/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  User,
  Store,
  MessageSquare,
  Mail,
  Lock,
  Facebook,
  Instagram,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button2 } from '@/components/ui/button2';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

interface EditProfileProps {
  seller: any;
  onProfileUpdated: () => void;
}

export default function EditProfile({ seller, onProfileUpdated }: EditProfileProps) {
  const { login } = useSellerAuth();
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    email: '',
    password: '',
    confirmPassword: '',
    facebook: '',
    line: '',
    instagram: '',
    whatsapp: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (seller) {
      setFormData({
        storeName: seller.store?.name || '',
        storeDescription: seller.store?.description || '',
        email: seller.email || '',
        password: '',
        confirmPassword: '',
        facebook: seller.contact?.facebook?.replace('fb.com/', '') || '',
        line: seller.contact?.line?.replace('@', '') || '',
        instagram: seller.contact?.instagram?.replace('@', '') || '',
        whatsapp: seller.contact?.whatsapp || '',
      });
      setLogoPreview(seller.store?.logoUrl || null);
    }
  }, [seller]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }

    if (!formData.storeDescription.trim()) {
      errors.storeDescription = 'Store description is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('storeName', formData.storeName);
      updateData.append('storeDescription', formData.storeDescription);
      updateData.append('email', formData.email);

      if (formData.password) {
        updateData.append('password', formData.password);
      }

      updateData.append('facebook', formData.facebook);
      updateData.append('line', formData.line);
      updateData.append('instagram', formData.instagram);
      updateData.append('whatsapp', formData.whatsapp);

      if (logoFile) {
        updateData.append('logo', logoFile);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v3/seller/details', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update seller details');
      }

      // If the API returns a new token, update it
      if (data.token) {
        login(data.token);
      }

      setSuccess('Profile updated successfully');

      // Clear password fields after successful update
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

      // Call the callback after a short delay to show success message
      setTimeout(() => {
        onProfileUpdated();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo upload section */}
      <Card className="bg-dark-700 border-dark-600 p-6">
        <div className="flex flex-col items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary-500/30 group-hover:border-primary-500 transition-all duration-300 bg-dark-600">
                    {logoPreview ? (
                      <Image
                        src={logoPreview || '/placeholder.svg'}
                        alt="Store logo"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-light-400">
                        <Store size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-dark-800/70 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity duration-300">
                      <div className="text-light-100 text-sm font-medium">Change Logo</div>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>
              </TooltipTrigger>
              <TooltipContent className="bg-dark-700 text-light-200 border-dark-600">
                <p>Upload store logo (Max 5MB)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-light-500">Click to upload a new logo</p>
        </div>
      </Card>

      {/* Store Information */}
      <Card className="bg-dark-700 border-dark-600 p-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-primary-500" />
            <h3 className="text-base font-semibold text-light-100">Store Information</h3>
          </div>
          <Separator className="bg-dark-600" />

          <div className="grid gap-5">
            <div className="space-y-2">
              <label htmlFor="storeName" className="text-sm font-medium text-light-300">
                Store Name *
              </label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                required
              />
              {fieldErrors.storeName && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldErrors.storeName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="storeDescription" className="text-sm font-medium text-light-300">
                Store Description *
              </label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                rows={4}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50 resize-none"
                required
              />
              {fieldErrors.storeDescription && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldErrors.storeDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Information */}
      <Card className="bg-dark-700 border-dark-600 p-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <User size={18} className="text-primary-500" />
            <h3 className="text-base font-semibold text-light-100">Account Information</h3>
          </div>
          <Separator className="bg-dark-600" />

          <div className="grid gap-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <Mail size={14} className="text-primary-500/70" />
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                required
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <Lock size={14} className="text-primary-500/70" />
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                placeholder="Leave blank to keep current password"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <Lock size={14} className="text-primary-500/70" />
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                placeholder="Confirm your new password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="bg-dark-700 border-dark-600 p-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-primary-500" />
            <h3 className="text-base font-semibold text-light-100">Contact Information</h3>
          </div>
          <Separator className="bg-dark-600" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label
                htmlFor="facebook"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <Facebook size={14} className="text-primary-500/70" />
                Facebook
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                  fb.com/
                </span>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="pl-14 bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                  placeholder="yourpage"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="line"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <MessageCircle size={14} className="text-primary-500/70" />
                Line ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                  @
                </span>
                <Input
                  id="line"
                  name="line"
                  value={formData.line}
                  onChange={handleChange}
                  className="pl-7 bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                  placeholder="yourlineid"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="instagram"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <Instagram size={14} className="text-primary-500/70" />
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                  @
                </span>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="pl-7 bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                  placeholder="yourinstagram (Optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="whatsapp"
                className="text-sm font-medium text-light-300 flex items-center gap-2">
                <MessageCircle size={14} className="text-primary-500/70" />
                WhatsApp
              </label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="bg-dark-600 border-dark-500 text-light-100 focus-visible:ring-primary-500/50"
                placeholder="+1234567890 (Optional)"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
          <AlertDescription className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex justify-end pt-2">
        <Button2
          type="submit"
          disabled={isLoading}
          className="bg-primary-500 hover:bg-primary-600 text-dark-800 font-medium min-w-[140px]">
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </Button2>
      </div>
    </form>
  );
}
