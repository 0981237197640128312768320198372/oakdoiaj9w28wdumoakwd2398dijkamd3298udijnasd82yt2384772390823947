'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Package, Wallet, Star, Calendar } from 'lucide-react';
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
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, theme }) => {
  const themeUtils = useThemeUtils(theme);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statItems = [
    {
      icon: Package,
      label: 'Total Activities',
      value: stats.totalActivities.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Wallet,
      label: 'Completed Transactions',
      value: stats.completedTransactions.toString(),
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Star,
      label: 'Interactions',
      value: stats.interactions.toString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: formatDate(stats.memberSince),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            'p-4 border backdrop-blur-sm transition-all duration-300 hover:shadow-md',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass()
          )}>
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', item.bgColor)}>
              <item.icon size={16} className={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                {item.label}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                {item.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
