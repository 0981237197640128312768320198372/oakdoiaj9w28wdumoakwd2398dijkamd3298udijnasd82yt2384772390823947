/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Mail, Lock, Store, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { useSellerAuth } from '@/context/SellerAuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
  onProfileUpdated: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  seller,
  onProfileUpdated,
}) => {
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
  }, [seller, isOpen]);

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

    // Validate passwords match if changing password
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

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen z-50 bg-dark-800/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto ">
      <div className="relative bg-dark-700 border border-dark-500 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 __dokmai_scrollbar">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-dark-600 bg-dark-700">
          <h2 className="text-xl font-bold text-light-100 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded-sm"></span>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-light-400 hover:text-light-100 hover:bg-dark-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* Logo upload section */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors duration-300">
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Store logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-dark-600 text-light-400">
                    <Store size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-dark-800/50  opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity duration-300">
                  <div className="text-light-100 text-xs font-medium">Change Logo</div>
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
            <p className="text-xs text-light-500">Click to upload a new logo</p>
          </div>

          {/* Store Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-light-300 flex items-center gap-2">
              <Store size={16} className="text-primary" />
              Store Information
            </h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="storeName"
                  className="block text-xs font-medium text-light-400 mb-1">
                  Store Name
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="storeDescription"
                  className="block text-xs font-medium text-light-400 mb-1">
                  Store Description
                </label>
                <textarea
                  id="storeDescription"
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none __dokmai_scrollbar"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-light-300 flex items-center gap-2">
              <User size={16} className="text-primary" />
              Account Information
            </h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-light-400 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-light-400 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-light-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-light-300 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="facebook" className="block text-xs font-medium text-light-400 mb-1">
                  Facebook
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                    fb.com/
                  </span>
                  <input
                    id="facebook"
                    name="facebook"
                    type="text"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full pl-14 pr-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="line" className="block text-xs font-medium text-light-400 mb-1">
                  Line ID
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                    @
                  </span>
                  <input
                    id="line"
                    name="line"
                    type="text"
                    value={formData.line}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-xs font-medium text-light-400 mb-1">
                  Instagram (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-500 text-xs">
                    @
                  </span>
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-xs font-medium text-light-400 mb-1">
                  WhatsApp (Optional)
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="text"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-600 hover:bg-dark-500 text-light-300 rounded-lg transition-colors duration-200">
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-dark-800 font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
