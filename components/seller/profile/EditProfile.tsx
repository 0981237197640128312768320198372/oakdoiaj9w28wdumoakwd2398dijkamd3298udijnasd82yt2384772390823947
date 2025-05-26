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
  AlertCircle,
  Upload,
  Check,
} from 'lucide-react';

import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import Image from 'next/image';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button2 } from '@/components/ui/button2';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import type { ThemeType } from '@/types';

interface EditProfileProps {
  seller: any;
  theme?: ThemeType | null; // Keep theme prop but don't use it for styling
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
    logoUrl: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
        logoUrl: seller.store?.logoUrl || '',
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

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      setIsUploading(false);
      return data.urls;
    } catch (error) {
      console.error('Error uploading images:', error);
      setIsUploading(false);
      return [];
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      try {
        const urls = await uploadImages([file]);
        if (urls.length > 0) {
          setFormData((prev) => ({ ...prev, logoUrl: urls[0] }));
        } else {
          setError('Failed to upload image. Please try again.');
        }
      } catch (err) {
        setError('Failed to upload image. Please try again.');
      }
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
      const updateData = {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        email: formData.email,
        password: formData.password || undefined,
        facebook: formData.facebook,
        line: formData.line,
        instagram: formData.instagram,
        whatsapp: formData.whatsapp,
        logoUrl: formData.logoUrl,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v3/seller/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update seller details');
      }

      if (data.token) {
        login(data.token);
      }

      setSuccess('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload Section */}
        <Card className="bg-dark-800 border-dark-700 p-6 w-full items-center">
          <div className="flex items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dark-600 group-hover:border-priamry transition-all duration-300 bg-dark-700">
                      {logoPreview ? (
                        <Image
                          src={logoPreview || '/placeholder.svg'}
                          alt="Store logo"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-light-500">
                          <Store size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity duration-300 bg-dark-800/80">
                        <div className="text-xs font-medium flex flex-col items-center gap-1 text-white">
                          {isUploading ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : formData.logoUrl ? (
                            <>
                              <Check size={20} className="text-green-500" />
                              <span>Change</span>
                            </>
                          ) : (
                            <>
                              <Upload size={20} />
                              <span>Upload</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={isUploading}
                    />
                  </label>
                </TooltipTrigger>
                <TooltipContent className="bg-dark-700 text-light-200 border-dark-600">
                  <p>Upload store logo (Max 5MB)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex-1">
              <p className="text-sm text-light-500">{isUploading && 'Uploading your logo...'}</p>
            </div>
          </div>
        </Card>

        {/* Store Information */}
        <Card className="bg-dark-800 border-dark-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-priamry" />
              <h3 className="text-lg font-semibold text-white">Store Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="storeName" className="text-sm font-medium text-light-300">
                  Store Name *
                </label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                  required
                />
                {fieldErrors.storeName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
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
                  rows={3}
                  className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 resize-none __dokmai_scrollbar"
                  required
                />
                {fieldErrors.storeDescription && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.storeDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="bg-dark-800 border-dark-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User size={18} className="text-priamry" />
              <h3 className="text-lg font-semibold text-white">Account Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-light-300 flex items-center gap-2">
                  <Mail size={14} className="text-primary " />
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-light-300 flex items-center gap-2">
                    <Lock size={14} className="text-primary " />
                    New Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                    placeholder="Leave blank to keep current"
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-light-300 flex items-center gap-2">
                    <Lock size={14} className="text-primary " />
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                    placeholder="Confirm new password"
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="bg-dark-800 border-dark-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-priamry" />
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="facebook"
                  className="text-sm font-medium text-light-300 flex items-center gap-2">
                  <FaFacebook size={14} className="text-primary " />
                  Facebook
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-500">
                    fb.com/
                  </span>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="pl-14 bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                    placeholder="yourpage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="line"
                  className="text-sm font-medium text-light-300 flex items-center gap-2">
                  <BsLine size={14} className="text-green-500 " />
                  Line ID
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-500">
                    @
                  </span>
                  <Input
                    id="line"
                    name="line"
                    value={formData.line}
                    onChange={handleChange}
                    className="pl-7 bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                    placeholder="yourlineid"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="instagram"
                  className="text-sm font-medium text-light-300 flex items-center gap-2">
                  <FaSquareInstagram size={14} className="text-pink-500 " />
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-500">
                    @
                  </span>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="pl-7 bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                    placeholder="yourinstagram"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="whatsapp"
                  className="text-sm font-medium text-light-300 flex items-center gap-2">
                  <IoLogoWhatsapp size={14} className="text-green-500 " />
                  WhatsApp
                </label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus-visible:ring-priamry/50 h-9"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Error and Success Messages */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 border-green-500/30">
            <AlertDescription className="flex items-center gap-2 text-green-500">
              <Check className="h-4 w-4" />
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex justify-end pt-4 border-t border-dark-700">
          <Button2
            type="submit"
            disabled={isLoading || isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6">
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
    </div>
  );
}
