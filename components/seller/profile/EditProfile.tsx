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
} from 'lucide-react';
import Image from 'next/image';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button2 } from '@/components/ui/button2';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  useEffect(() => {
    if (seller) {
      setFormData({
        storeName: seller.store.name || '',
        storeDescription: seller.store.description || '',
        email: seller.email || '',
        password: '',
        confirmPassword: '',
        facebook: seller.contact?.facebook?.replace('fb.com/', '') || '',
        line: seller.contact?.line?.replace('@', '') || '',
        instagram: seller.contact?.instagram?.replace('@', '') || '',
        whatsapp: seller.contact?.whatsapp || '',
      });
      setLogoPreview(seller.store.logoUrl || null);
    }
  }, [seller]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    setIsLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

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

      const response = await fetch('/api/v3/seller/update-profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: updateData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      if (data.token) {
        login(data.token);
      }

      setSuccess('Profile updated successfully');
      onProfileUpdated();
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo upload section */}
      <div className="flex flex-col items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <label className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary-500/30 group-hover:border-primary-500 transition-colors duration-300 bg-dark-700">
                  {logoPreview ? (
                    <Image
                      src={logoPreview || '/placeholder.svg'}
                      alt="Store logo"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-light-400">
                      <Store size={36} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-dark-800/70 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity duration-300">
                    <div className="text-light-100 text-xs font-medium">Change Logo</div>
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
              <p>Upload store logo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-xs text-light-500">Click to upload a new logo</p>
      </div>

      {/* Store Information */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Store size={18} className="text-primary-500" />
          <h3 className="text-base font-semibold text-light-100">Store Information</h3>
        </div>
        <Separator className="bg-dark-600" />

        <div className="grid gap-5">
          <div className="space-y-2">
            <label htmlFor="storeName" className="text-sm font-medium text-light-300">
              Store Name
            </label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="storeDescription" className="text-sm font-medium text-light-300">
              Store Description
            </label>
            <Textarea
              id="storeDescription"
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleChange}
              rows={3}
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50 resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Account Information */}
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
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
              required
            />
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
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
              placeholder="Leave blank to keep current password"
            />
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
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
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
                className="pl-14 bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
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
                className="pl-7 bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
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
                className="pl-7 bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
                placeholder="Optional"
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
              className="bg-dark-700 border-dark-600 text-light-100 focus-visible:ring-primary-500/50"
              placeholder="+1234567890 (Optional)"
            />
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Form Actions */}
      <div className="flex justify-end pt-2">
        <Button2
          type="submit"
          disabled={isLoading}
          className="bg-primary-500 hover:bg-primary-600 text-dark-800 font-medium">
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
