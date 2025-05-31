/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, User, Eye, EyeOff, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface EditProfileModalProps {
  buyer: any;
  theme: ThemeType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  buyer,
  theme,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const themeUtils = useThemeUtils(theme);
  const { isAuthenticated } = useBuyerAuth();
  const { updateBuyerDetails } = useBuyerDetailsWithSWR();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: buyer.name || '',
    username: buyer.username || '',
    email: buyer.email || '',
    avatarUrl: buyer.avatarUrl || '',
    contact: {
      facebook: buyer.contact?.facebook || '',
      instagram: buyer.contact?.instagram || '',
      whatsapp: buyer.contact?.whatsapp || '',
      line: buyer.contact?.line || '',
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (buyer.avatarUrl) {
      setAvatarPreview(buyer.avatarUrl);
    }
  }, [buyer.avatarUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'name' || name === 'username' || name === 'email') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (name.startsWith('password')) {
      setPasswordData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [name]: value,
        },
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      const formData = new FormData();
      // The API expects 'images' field, not 'file'
      formData.append('images', selectedFile);

      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      // The API returns an array of URLs in the 'urls' property
      return data.urls?.[0] || null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to update your profile');
      }

      const token = localStorage.getItem('buyerToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Upload avatar if a new one was selected
      let avatarUrl = formData.avatarUrl;
      if (selectedFile) {
        console.log('Uploading avatar file:', selectedFile.name);
        const uploadedUrl = await uploadAvatar();
        console.log('Received avatar URL:', uploadedUrl);

        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          console.log('Setting new avatar URL:', avatarUrl);
        } else {
          console.warn('Failed to get avatar URL from upload');
        }
      }

      // Create request body with explicit properties
      const requestBody = {
        name: formData.name,
        username: formData.username,
        contact: formData.contact,
        avatarUrl: avatarUrl, // Use the updated avatarUrl
      };

      console.log('Sending profile update with data:', requestBody);

      // Use the SWR hook to update buyer details
      const success = await updateBuyerDetails(requestBody);

      if (!success) {
        throw new Error('Failed to update profile');
      }

      // Update local form data with the new avatar URL
      setFormData((prev) => ({
        ...prev,
        avatarUrl: avatarUrl,
      }));

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to update your password');
      }

      const token = localStorage.getItem('buyerToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Validate passwords
      if (passwordData.password !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (passwordData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Use the SWR hook to update password
      const success = await updateBuyerDetails({
        password: passwordData.password,
        currentPassword: passwordData.currentPassword,
      });

      if (!success) {
        throw new Error('Failed to update password');
      }

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'w-full max-w-md p-4 border backdrop-blur-sm transition-all duration-300 max-h-[90vh] overflow-y-auto',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getComponentShadowClass()
        )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'profile'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}>
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'password'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}>
            Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                  <Avatar className="w-24 h-24 border-2 border-gray-200 dark:border-gray-700">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={formData.name || 'User'} />
                    ) : (
                      <AvatarFallback>
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Click to change avatar</p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}
                  placeholder="Your full name"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}
                  placeholder="Username"
                />
                <p className="mt-1 text-xs text-gray-500">This will be displayed on your profile</p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className={cn(
                    'w-full px-3 py-2 text-sm border bg-gray-50 dark:bg-gray-800 cursor-not-allowed focus:outline-none transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="facebook"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      name="facebook"
                      type="text"
                      value={formData.contact.facebook}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}
                      placeholder="facebook.com/yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      value={formData.contact.instagram}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="text"
                      value={formData.contact.whatsapp}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}
                      placeholder="+66812345678"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="line"
                      className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Line ID
                    </label>
                    <input
                      id="line"
                      name="line"
                      type="text"
                      value={formData.contact.line}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300',
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'px-4 py-2 text-xs font-medium border transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-2',
                    themeUtils.getButtonClass(),
                    themeUtils.getComponentRoundednessClass(),
                    isLoading && 'opacity-70 cursor-not-allowed'
                  )}>
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300 pr-10',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass()
                    )}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => togglePasswordVisibility('current')}>
                    {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.password}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300 pr-10',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass()
                    )}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => togglePasswordVisibility('new')}>
                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    className={cn(
                      'w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-300 pr-10',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass()
                    )}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => togglePasswordVisibility('confirm')}>
                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'px-4 py-2 text-xs font-medium border transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-2',
                    themeUtils.getButtonClass(),
                    themeUtils.getComponentRoundednessClass(),
                    isLoading && 'opacity-70 cursor-not-allowed'
                  )}>
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
