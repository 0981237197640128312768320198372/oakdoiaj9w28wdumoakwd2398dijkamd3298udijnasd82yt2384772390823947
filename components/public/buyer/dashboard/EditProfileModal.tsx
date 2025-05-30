/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: buyer.username || '',
    contact: {
      facebook: buyer.contact?.facebook || '',
      instagram: buyer.contact?.instagram || '',
      whatsapp: buyer.contact?.whatsapp || '',
      line: buyer.contact?.line || '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'username') {
      setFormData((prev) => ({ ...prev, username: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      const response = await fetch('/api/v3/buyer/details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
      </motion.div>
    </div>
  );
};
