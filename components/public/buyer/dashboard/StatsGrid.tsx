'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { History, Wallet, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface StatsGridProps {
  stats: {
    totalActivities: number;
    completedTransactions: number;
    interactions: number;
    memberSince: string;
  };
  theme: ThemeType | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, theme, activeTab, onTabChange }) => {
  const themeUtils = useThemeUtils(theme);

  const statItems = [
    {
      id: 'activities',
      icon: History,
      label: 'Total Activities',
      value: stats.totalActivities.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      id: 'transactions',
      icon: Wallet,
      label: 'Completed Transactions',
      value: stats.completedTransactions.toString(),
      color: 'text-green-500',
      bgColor: 'bg-green-500/20 ',
    },
    {
      id: 'interactions',
      icon: Star,
      label: 'Interactions',
      value: stats.interactions.toString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20 ',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            'p-4 border backdrop-blur-sm transition-all duration-300 hover:shadow-md cursor-pointer',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass(),
            activeTab === item.id &&
              'ring-2 ring-offset-2 ' + themeUtils.getPrimaryColorClass('text')
          )}
          onClick={() => onTabChange(item.id)}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', item.bgColor)}>
              <item.icon size={16} className={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{item.label}</p>
              <p className="text-sm font-bold truncate">{item.value}</p>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabChange(item.id);
              }}
              className={cn(
                'w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-300',
                themeUtils.getComponentRoundednessClass(),
                activeTab === item.id
                  ? cn(themeUtils.getButtonClass(), 'shadow-sm')
                  : cn('border hover:shadow-sm hover:opacity-80')
              )}>
              <item.icon size={14} />
              <span>View {item.id.charAt(0).toUpperCase() + item.id.slice(1)}</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
