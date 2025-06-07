/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, User, Eye, EyeOff, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useBuyerDetailsWithSWR } from '@/hooks/useBuyerDetailsWithSWR';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface EditProfileModalProps {
  buyer: any;
  theme: any;
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
  const { updateBuyerDetails, refreshBuyerDetails } = useBuyerDetailsWithSWR();
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
    } else if (['currentPassword', 'password', 'confirmPassword'].includes(name)) {
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

      formData.append('images', selectedFile);

      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();

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
        throw new Error('คุณต้องเข้าสู่ระบบเพื่อแก้ไขโปรไฟล์');
      }

      const token = localStorage.getItem('buyerToken');
      if (!token) {
        throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
      }

      let avatarUrl = formData.avatarUrl;
      if (selectedFile) {
        // console.log('Uploading avatar file:', selectedFile.name);
        const uploadedUrl = await uploadAvatar();
        // console.log('Received avatar URL:', uploadedUrl);

        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          // console.log('Setting new avatar URL:', avatarUrl);
        } else {
          console.warn('Failed to get avatar URL from upload');
        }
      }

      const requestBody = {
        name: formData.name,
        username: formData.username,
        contact: formData.contact,
        avatarUrl: avatarUrl,
      };

      // console.log('Sending profile update with data:', requestBody);

      const success = await updateBuyerDetails(requestBody);
      if (success) {
        await refreshBuyerDetails();
      }

      if (!success) {
        throw new Error('ไม่สามารถอัปเดตโปรไฟล์ได้');
      }

      setFormData((prev) => ({
        ...prev,
        avatarUrl: avatarUrl,
      }));

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดขณะอัปเดตโปรไฟล์ของคุณ');
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
        throw new Error('คุณต้องเข้าสู่ระบบเพื่อเปลี่ยนรหัสผ่าน');
      }

      const token = localStorage.getItem('buyerToken');
      if (!token) {
        throw new Error('ไม่พบโทเค็นการยืนยันตัวตน');
      }

      if (passwordData.password !== passwordData.confirmPassword) {
        throw new Error('รหัสผ่านใหม่ไม่ตรงกัน');
      }

      if (passwordData.password.length < 8) {
        throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      }

      const success = await updateBuyerDetails({
        password: passwordData.password,
        currentPassword: passwordData.currentPassword,
      });
      if (success) {
        await refreshBuyerDetails();
      }

      if (!success) {
        throw new Error('ไม่สามารถอัปเดตรหัสผ่านได้');
      }

      setPasswordData({
        currentPassword: '',
        password: '',
        confirmPassword: '',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดขณะอัปเดตรหัสผ่านของคุณ');
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
          <h2 className="text-lg font-semibold ">แก้ไขโปรไฟล์</h2>
          <button onClick={onClose} className="p-1 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/15 border border-red-500 text-red-500 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'profile'
                ? 'border-b-2 ' +
                    themeUtils.getPrimaryColorClass('border') +
                    ' ' +
                    themeUtils.getPrimaryColorClass('text')
                : 'text-gray-500 hover:text-gray-700 '
            )}>
            โปรไฟล์
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              activeTab === 'password'
                ? 'border-b-2 ' +
                    themeUtils.getPrimaryColorClass('border') +
                    ' ' +
                    themeUtils.getPrimaryColorClass('text')
                : 'text-gray-500 hover:text-gray-700 '
            )}>
            รหัสผ่าน
          </button>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                  <Avatar className="w-24 h-24 border-2 ">
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
                <p className="mt-2 text-xs text-gray-500">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-medium mb-1">
                  ชื่อเต็ม
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
                  placeholder="ชื่อเต็มของคุณ"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
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
                  placeholder="ชื่อผู้ใช้"
                />
                <p className="mt-1 text-xs text-gray-500">ชื่อนี้จะแสดงบนโปรไฟล์ของคุณ</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium mb-1">
                  อีเมล
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className={cn(
                    'w-full px-3 py-2 text-sm border bg-gray-50 cursor-not-allowed focus:outline-none transition-all duration-300',
                    themeUtils.getCardClass(),
                    themeUtils.getComponentRoundednessClass()
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">ไม่สามารถเปลี่ยนอีเมลได้</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">ข้อมูลการติดต่อ</h3>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="facebook"
                      className="block text-xs font-medium text-gray-700 mb-1">
                      เฟซบุ๊ก
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
                      className="block text-xs font-medium text-gray-700 mb-1">
                      อินสตาแกรม
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
                      className="block text-xs font-medium text-gray-700 mb-1">
                      วอตส์แอป
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
                    <label htmlFor="line" className="block text-xs font-medium text-gray-700 mb-1">
                      ไอดีไลน์
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
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-2',
                    themeUtils.getButtonClass(),
                    themeUtils.getComponentRoundednessClass(),
                    themeUtils.getPrimaryColorClass('border'),
                    isLoading && 'opacity-70 cursor-not-allowed'
                  )}>
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      บันทึกการเปลี่ยนแปลง
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
                  className="block text-xs font-medium text-gray-700 mb-1">
                  รหัสผ่านปัจจุบัน
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
                    placeholder="ใส่รหัสผ่านปัจจุบันของคุณ"
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
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                  รหัสผ่านใหม่
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
                    placeholder="ใส่รหัสผ่านใหม่"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => togglePasswordVisibility('new')}>
                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-gray-700 mb-1">
                  ยืนยันรหัสผ่านใหม่
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
                    placeholder="ยืนยันรหัสผ่านใหม่"
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
                  ยกเลิก
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
                      กำลังอัปเดตรหัสผ่าน...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      อัปเดตรหัสผ่าน
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
