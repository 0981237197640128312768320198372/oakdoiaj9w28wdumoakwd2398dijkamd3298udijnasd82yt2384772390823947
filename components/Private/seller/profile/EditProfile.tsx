/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  User,
  Store,
  MessageSquare,
  Mail,
  Lock,
  AlertCircle,
  Check,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button2 } from '@/components/ui/button2';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import type { ThemeType } from '@/types';

interface EditProfileProps {
  seller: any;
  theme?: ThemeType | null;
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

    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append('images', file));

    try {
      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formDataUpload,
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

      const token = localStorage.getItem('sellerToken');
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
        <Card className="bg-dark-800 border-dark-700 p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white flex items-center">
              <Store className="h-4 w-4 mr-2 text-primary" />
              Store Logo
            </h3>

            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="relative group cursor-pointer">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-dark-600 group-hover:border-primary transition-all duration-300 bg-dark-700">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Store logo"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-light-400">
                            <Store size={24} />
                          </div>
                        )}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity duration-300 bg-dark-800/80">
                          <div className="text-xs font-medium flex flex-col items-center gap-1 text-white">
                            {isUploading ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : formData.logoUrl ? (
                              <>
                                <Check size={16} className="text-green-500" />
                                <span>Change</span>
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
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
                  <TooltipContent className="bg-dark-800 text-white border-dark-700">
                    <p className="text-xs">Upload store logo (Max 5MB)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1">
                <p className="text-xs text-light-400">
                  Upload a logo for your store. Recommended size: 200x200px
                </p>
                {isUploading && <p className="text-xs text-primary mt-1">Uploading your logo...</p>}
              </div>
            </div>
          </div>
        </Card>

        {/* Store Information */}
        <Card className="bg-dark-800 border-dark-700 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-primary" />
              <h3 className="text-sm font-medium text-white">Store Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="storeName" className="text-xs font-medium text-light-300">
                  Store Name *
                </label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
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
                <label htmlFor="storeDescription" className="text-xs font-medium text-light-300">
                  Store Description *
                </label>
                <Textarea
                  id="storeDescription"
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  rows={3}
                  className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary resize-none text-xs"
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
        <Card className="bg-dark-800 border-dark-700 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-primary" />
              <h3 className="text-sm font-medium text-white">Account Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-light-300 flex items-center gap-2">
                  <Mail size={12} className="text-primary" />
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-light-300 flex items-center gap-2">
                    <Lock size={12} className="text-primary" />
                    New Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                    placeholder="Leave blank to keep current"
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
                    className="text-xs font-medium text-light-300 flex items-center gap-2">
                    <Lock size={12} className="text-primary" />
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                    placeholder="Confirm new password"
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
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="bg-dark-800 border-dark-700 p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              <h3 className="text-sm font-medium text-white">Contact Information</h3>
            </div>
            <Separator className="bg-dark-600" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="facebook"
                  className="text-xs font-medium text-light-300 flex items-center gap-2">
                  <FaFacebook size={12} className="text-primary" />
                  Facebook
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-400">
                    fb.com/
                  </span>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="pl-14 bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                    placeholder="yourpage"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="line"
                  className="text-xs font-medium text-light-300 flex items-center gap-2">
                  <BsLine size={12} className="text-primary" />
                  Line ID
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-400">
                    @
                  </span>
                  <Input
                    id="line"
                    name="line"
                    value={formData.line}
                    onChange={handleChange}
                    className="pl-7 bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                    placeholder="yourlineid"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="instagram"
                  className="text-xs font-medium text-light-300 flex items-center gap-2">
                  <FaSquareInstagram size={12} className="text-primary" />
                  Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-light-400">
                    @
                  </span>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="pl-7 bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
                    placeholder="yourinstagram"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="whatsapp"
                  className="text-xs font-medium text-light-300 flex items-center gap-2">
                  <IoLogoWhatsapp size={12} className="text-primary" />
                  WhatsApp
                </label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="bg-dark-700 border-dark-600 text-white focus:ring-primary focus:border-primary h-9 text-xs"
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
        <div className="flex justify-end pt-4 border-t border-dark-600">
          <Button2
            type="submit"
            disabled={isLoading || isUploading}
            className="bg-primary hover:bg-primary/80 text-dark-800 h-9 px-6 text-xs">
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" />
                Save Changes
              </>
            )}
          </Button2>
        </div>
      </form>
    </div>
  );
}
