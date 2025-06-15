'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, ShoppingBag, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useStoreCredits } from '@/hooks/useStoreCredits';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import type { ThemeType } from '@/types';

interface StoreCreditButtonsProps {
  sellerId: string;
  theme: ThemeType | null;
  className?: string;
}

export const StoreCreditButtons: React.FC<StoreCreditButtonsProps> = ({
  sellerId,
  theme,
  className,
}) => {
  const themeUtils = useThemeUtils(theme);
  const { isAuthenticated } = useBuyerAuth();
  const { stats, userCredit, purchaseInfo, isLoading, error, submitCredit, removeCredit } =
    useStoreCredits(sellerId);
  const [actionLoading, setActionLoading] = useState<'positive' | 'negative' | 'remove' | null>(
    null
  );

  const isLight = themeUtils.baseTheme === 'light';

  const handleCreditAction = async (creditType: 'positive' | 'negative') => {
    if (!isAuthenticated || !purchaseInfo?.hasPurchased) return;

    try {
      setActionLoading(creditType);

      if (userCredit?.creditType === creditType) {
        // Remove existing credit if clicking the same type
        await removeCredit();
      } else {
        // Submit new credit
        await submitCredit(creditType);
      }
    } catch (err) {
      console.error('Error handling credit action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCredit = async () => {
    try {
      setActionLoading('remove');
      await removeCredit();
    } catch (err) {
      console.error('Error removing credit:', err);
    } finally {
      setActionLoading('remove');
    }
  };

  // Show login prompt for guests
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          'p-4 border rounded-lg text-center space-y-3',
          isLight
            ? 'bg-light-50 border-light-200 text-dark-600'
            : 'bg-dark-800/50 border-dark-600 text-light-400',
          themeUtils.getComponentRoundednessClass(),
          className
        )}>
        <LogIn size={24} className="mx-auto opacity-60" />
        <div>
          <p className="text-sm font-medium mb-1">เข้าสู่ระบบเพื่อให้คะแนนร้านค้า</p>
          <p className="text-xs opacity-70">ช่วยลูกค้าคนอื่นในการตัดสินใจ</p>
        </div>
      </div>
    );
  }

  // Show purchase requirement for authenticated users who haven't purchased
  if (isAuthenticated && purchaseInfo && !purchaseInfo.hasPurchased) {
    return (
      <div
        className={cn(
          'p-4 border rounded-lg text-center space-y-3',
          isLight
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-amber-900/20 border-amber-600 text-amber-300',
          themeUtils.getComponentRoundednessClass(),
          className
        )}>
        <ShoppingBag size={24} className="mx-auto opacity-60" />
        <div>
          <p className="text-sm font-medium mb-1">ซื้อสินค้าก่อนให้คะแนน</p>
          <p className="text-xs opacity-70">คุณต้องซื้อสินค้าจากร้านนี้ก่อนถึงจะให้คะแนนได้</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 border rounded-lg space-y-4',
        isLight
          ? 'bg-light-50 border-light-200 text-dark-800'
          : 'bg-dark-800/50 border-dark-600 text-light-200',
        themeUtils.getComponentRoundednessClass(),
        className
      )}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-1">ให้คะแนนร้านค้า</h3>
        <p className="text-xs opacity-70">ช่วยลูกค้าคนอื่นในการตัดสินใจ</p>
      </div>

      {/* Credit Stats */}
      {stats && (
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-green-600">
            <ThumbsUp size={12} />
            <span>{stats.positiveCount}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <ThumbsDown size={12} />
            <span>{stats.negativeCount}</span>
          </div>
          {stats.totalCount > 0 && (
            <div className="text-center">
              <span className="font-medium">{stats.positivePercentage}%</span>
              <span className="opacity-60"> บวก</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Positive Button */}
        <button
          onClick={() => handleCreditAction('positive')}
          disabled={isLoading || actionLoading !== null}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200',
            userCredit?.creditType === 'positive'
              ? 'bg-green-600 text-white shadow-lg scale-105'
              : isLight
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-green-900/20 text-green-400 border border-green-600/30 hover:bg-green-900/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
            themeUtils.getComponentRoundednessClass()
          )}>
          {actionLoading === 'positive' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ThumbsUp size={16} />
          )}
          <span>ดี</span>
        </button>

        {/* Negative Button */}
        <button
          onClick={() => handleCreditAction('negative')}
          disabled={isLoading || actionLoading !== null}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200',
            userCredit?.creditType === 'negative'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : isLight
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : 'bg-red-900/20 text-red-400 border border-red-600/30 hover:bg-red-900/30',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
            themeUtils.getComponentRoundednessClass()
          )}>
          {actionLoading === 'negative' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ThumbsDown size={16} />
          )}
          <span>ไม่ดี</span>
        </button>
      </div>

      {/* Remove Credit Option */}
      {userCredit && (
        <div className="text-center">
          <button
            onClick={handleRemoveCredit}
            disabled={actionLoading !== null}
            className={cn(
              'text-xs opacity-60 hover:opacity-80 transition-opacity',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}>
            {actionLoading === 'remove' ? 'กำลังลบ...' : 'ลบคะแนน'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {/* Purchase Summary */}
      {purchaseInfo?.purchaseSummary && (
        <div className="text-xs opacity-60 text-center pt-2 border-t border-opacity-20">
          ซื้อแล้ว {purchaseInfo.purchaseSummary.totalOrders} ครั้ง
        </div>
      )}
    </div>
  );
};
