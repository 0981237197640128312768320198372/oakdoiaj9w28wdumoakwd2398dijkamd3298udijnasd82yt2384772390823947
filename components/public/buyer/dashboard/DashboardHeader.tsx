/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, User, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { ContactInfo } from './ContactInfo';
import { EditProfileModal } from './EditProfileModal';

interface DashboardHeaderProps {
  buyer: any;
  theme: ThemeType | null;
  onProfileUpdate?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  buyer,
  theme,
  onProfileUpdate,
}) => {
  const themeUtils = useThemeUtils(theme);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleProfileUpdate = () => {
    if (onProfileUpdate) {
      onProfileUpdate();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'p-4 border backdrop-blur-sm transition-all duration-300',
          themeUtils.getCardClass(),
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getComponentShadowClass()
        )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {buyer.name?.charAt(0)?.toUpperCase() || <User size={20} />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {buyer.name}
              </h1>
              <p className="text-xs text-gray-500 truncate">{buyer.email}</p>
              {buyer.username && <p className="text-xs text-gray-400">@{buyer.username}</p>}
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={12} className="text-purple-500" />
                <span>Member since {formatDate(buyer.createdAt)}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-80',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                'border hover:shadow-sm'
              )}>
              <MessageSquare size={14} />
              <span className="hidden sm:inline">Contact</span>
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-80',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                'border hover:shadow-sm'
              )}>
              <Edit size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>

        {showContactInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4">
            <ContactInfo buyer={buyer} theme={theme} />
          </motion.div>
        )}
      </motion.div>{' '}
      <EditProfileModal
        buyer={buyer}
        theme={theme}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleProfileUpdate}
      />
    </>
  );
};
