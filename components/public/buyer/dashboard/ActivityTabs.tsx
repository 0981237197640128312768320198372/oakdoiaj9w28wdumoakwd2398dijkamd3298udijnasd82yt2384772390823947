'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { User, History, Wallet, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface ActivityTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  theme: ThemeType | null;
}

export const ActivityTabs: React.FC<ActivityTabsProps> = ({ activeTab, onTabChange, theme }) => {
  const themeUtils = useThemeUtils(theme);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activities', label: 'Activities', icon: History },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'interactions', label: 'Interactions', icon: Star },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap',
            themeUtils.getComponentRoundednessClass(),
            activeTab === tab.id
              ? cn(themeUtils.getButtonClass(), 'shadow-sm')
              : cn(
                  themeUtils.getCardClass(),
                  'border hover:shadow-sm hover:opacity-80',
                  'text-gray-600 dark:text-gray-400'
                )
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
          <tab.icon size={14} />
          <span>{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
