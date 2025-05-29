'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Edit, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface DashboardHeaderProps {
  buyer: any;
  theme: ThemeType | null;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ buyer, theme, onLogout }) => {
  const themeUtils = useThemeUtils(theme);

  return (
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
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-80',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              'border hover:shadow-sm'
            )}>
            <Edit size={14} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={onLogout}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:opacity-80',
              'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
              'dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30',
              themeUtils.getComponentRoundednessClass()
            )}>
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
