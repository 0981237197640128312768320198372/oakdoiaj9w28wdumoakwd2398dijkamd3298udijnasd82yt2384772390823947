'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface BalanceCardProps {
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
  theme: ThemeType | null;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  showBalance,
  onToggleBalance,
  theme,
}) => {
  const themeUtils = useThemeUtils(theme);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        'p-4 border backdrop-blur-sm transition-all duration-300 w-full',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getComponentShadowClass()
      )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'p-2 rounded-lg',
              themeUtils.getPrimaryColorClass('bg'),
              'bg-opacity-10'
            )}>
            <Wallet size={16} className={themeUtils.getPrimaryColorClass('text')} />
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Account Balance
          </h2>
        </div>
        <button
          onClick={onToggleBalance}
          className={cn(
            'p-1.5 transition-all duration-300 hover:opacity-70',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass(),
            'border'
          )}>
          {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      <div className="mb-4">
        <motion.div
          key={showBalance ? 'visible' : 'hidden'}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-bold text-green-600 dark:text-green-400">
          {showBalance ? formatCurrency(balance) : '••••••'}
        </motion.div>
        <p className="text-xs text-gray-500 mt-1">Available for transactions</p>
      </div>

      <div className="flex gap-2">
        <button
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium transition-all duration-300',
            'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100',
            'dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30',
            themeUtils.getComponentRoundednessClass()
          )}>
          <TrendingUp size={14} />
          Deposit
        </button>
      </div>
    </motion.div>
  );
};
