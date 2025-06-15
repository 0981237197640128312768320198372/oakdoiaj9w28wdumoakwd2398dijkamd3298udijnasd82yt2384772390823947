/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { useState } from 'react';
import { PublicInfoSection } from './PublicInfoSection';
import {
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Package,
  ShoppingCart,
  X,
  Loader2,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useSellerStats } from '@/hooks/useSellerStats';

interface PublicStoreStatsProps {
  seller: any;
  theme?: any;
  storeCreditStats?: {
    positiveCount: number;
    negativeCount: number;
    totalCount: number;
    positivePercentage: number;
  } | null;
  isAuthenticated?: boolean;
  purchaseInfo?: {
    hasPurchased: boolean;
  } | null;
  onSubmitCredit?: (creditType: 'positive' | 'negative') => Promise<any>;
}

export function PublicStoreStats({
  seller,
  theme,
  storeCreditStats,
  isAuthenticated = false,
  purchaseInfo = null,
  onSubmitCredit,
}: PublicStoreStatsProps) {
  const { rating } = seller.store;
  const themeUtils = useThemeUtils(theme);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch seller statistics using the custom hook
  const {
    statistics,
    isLoading: statsLoading,
    error: statsError,
  } = useSellerStats(seller?.username || null);

  const totalProducts = statistics?.totalProducts ?? 0;
  const totalSales = statistics?.totalSales ?? 0;

  // Use real credit stats or fallback to 0
  const totalCredits = storeCreditStats?.totalCount ?? 0;
  const positiveCount = storeCreditStats?.positiveCount ?? 0;
  const negativeCount = storeCreditStats?.negativeCount ?? 0;
  const positivePercentage = storeCreditStats?.positivePercentage ?? 0;

  // Show error state if statistics failed to load
  const showError = statsError && !statsLoading;

  // Handle credit submission
  const handleCreditClick = async (creditType: 'positive' | 'negative') => {
    // Check authentication
    if (!isAuthenticated) {
      setModalMessage('กรุณาเข้าสู่ระบบก่อนให้คะแนนร้านค้า');
      setShowModal(true);
      return;
    }

    // Check purchase requirement
    if (!purchaseInfo?.hasPurchased) {
      setModalMessage('กรุณาซื้อสินค้าจากร้านนี้ก่อนเพื่อให้คะแนน');
      setShowModal(true);
      return;
    }

    // Submit credit if all checks pass
    if (onSubmitCredit) {
      setIsSubmitting(true);
      try {
        await onSubmitCredit(creditType);
        setModalMessage(`ให้คะแนน${creditType === 'positive' ? 'บวก' : 'ลบ'}สำเร็จแล้ว!`);
        setShowModal(true);
      } catch (error) {
        setModalMessage('เกิดข้อผิดพลาดในการให้คะแนน กรุณาลองใหม่อีกครั้ง');
        setShowModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <PublicInfoSection title="สถิติร้าน" icon={<TrendingUp className="w-4 h-4" />} theme={theme}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              icon={<Package className="h-6 w-6" />}
              label="สินค้า"
              value={statsLoading ? '...' : showError ? 'N/A' : totalProducts}
              color="blue"
              theme={theme}
            />
            <StatItem
              icon={<ShoppingCart className="h-6 w-6" />}
              label="ขายแล้ว"
              value={statsLoading ? '...' : showError ? 'N/A' : totalSales}
              color="fuchsia"
              theme={theme}
            />
          </div>

          <div
            className={cn(
              'space-y-4 pt-5 border-t',
              themeUtils.baseTheme === 'light' ? 'border-light-400/50' : 'border-dark-300/50'
            )}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p
                  className={cn(
                    'text-xs font-medium',
                    themeUtils.baseTheme === 'light' ? 'text-dark-800' : 'text-white'
                  )}>
                  เครดิต
                </p>
                <p
                  className={cn(
                    'text-xs',
                    themeUtils.baseTheme === 'light' ? 'text-dark-500' : 'text-muted-foreground'
                  )}>
                  {totalCredits} เครดิต
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <StatItem
                  icon={<ThumbsUp className="h-6 w-6" />}
                  label="บวก"
                  value={positiveCount}
                  color="green"
                  theme={theme}
                  onClick={() => handleCreditClick('positive')}
                  isClickable={true}
                  isLoading={isSubmitting}
                />
                <StatItem
                  icon={<ThumbsDown className="h-6 w-6" />}
                  label="ลบ"
                  value={negativeCount}
                  color="red"
                  theme={theme}
                  onClick={() => handleCreditClick('negative')}
                  isClickable={true}
                  isLoading={isSubmitting}
                />
              </div>
              <div
                className={cn(
                  'relative h-1.5 w-full rounded-full overflow-hidden',
                  themeUtils.baseTheme === 'light' ? 'bg-light-300' : 'bg-background'
                )}>
                <div
                  className="absolute inset-0 h-full bg-green-500 transition-all duration-1000 ease-out"
                  style={{ width: `${positivePercentage}%` }}
                />
              </div>
              <p
                className={cn(
                  'text-xs font-medium mt-1',
                  themeUtils.baseTheme === 'light' ? 'text-dark-800' : 'text-white'
                )}>
                {positivePercentage}% ระดับความพอใจ
              </p>
            </div>
          </div>
        </div>
      </PublicInfoSection>

      {/* Modal for messages */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={cn(
              'bg-white rounded-lg p-6 max-w-sm w-full mx-4',
              themeUtils.getCardClass()
            )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn('text-sm font-semibold', themeUtils.getTextColors())}>แจ้งเตือน</h3>
              <button
                onClick={() => setShowModal(false)}
                className={cn(
                  'p-1 rounded-full hover:bg-gray-100 transition-colors',
                  themeUtils.baseTheme === 'dark' && 'hover:bg-gray-800'
                )}>
                <X size={16} />
              </button>
            </div>
            <p className={cn('text-xs mb-4', themeUtils.getTextColors())}>{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className={cn(
                'w-full py-2 px-4 rounded-md text-xs font-medium transition-all duration-200',
                themeUtils.getButtonClass()
              )}>
              ตกลง
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'emerald' | 'yellow' | 'green' | 'red' | 'fuchsia';
  children?: React.ReactNode;
  theme?: any;
  onClick?: () => void;
  isClickable?: boolean;
  isLoading?: boolean;
}

function StatItem({
  icon,
  label,
  value,
  color = 'blue',
  children,
  theme,
  onClick,
  isClickable = false,
  isLoading = false,
}: StatItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const themeUtils = useThemeUtils(theme);

  const colorStyles = {
    blue: 'hover:border-blue-400/50 hover:via-blue-400/20 via-blue-400/5 text-blue-500',
    purple: 'hover:border-primary/50 hover:via-primary/10 via-primary/5 text-primary',
    emerald:
      'hover:border-emerald-400/50 hover:via-emerald-400/20 via-emerald-400/5 text-emerald-500',
    yellow: 'hover:border-yellow-400/50 hover:via-yellow-400/20 via-yellow-400/5 text-yellow-400',
    green: 'hover:border-green-400/50 hover:via-green-400/20 via-green-400/5 text-green-500',
    red: 'hover:border-red-400/50 hover:via-red-400/20 via-red-400/5 text-red-500',
    fuchsia:
      'hover:border-fuchsia-400/50 hover:via-fuchsia-400/20 via-fuchsia-400/5 text-fuchsia-500',
  };

  return (
    <div
      className={cn(
        'group border-[0.5px] p-2 from-5% via-55% to-100% transition-all duration-500 rounded-xl',
        'bg-gradient-to-tr from-transparent to-transparent',
        themeUtils.baseTheme === 'light' ? 'border-light-300' : 'border-transparent',
        colorStyles[color],
        isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default',
        isLoading && 'opacity-50 pointer-events-none'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isClickable && !isLoading ? onClick : undefined}>
      <div className="flex items-center gap-2">
        <div className={cn('transition-transform duration-300', isHovered ? 'scale-110' : '')}>
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-xs',
              themeUtils.baseTheme === 'light' ? 'text-dark-600' : 'text-muted-foreground'
            )}>
            {label}
          </p>
          <p
            className={cn(
              'text-sm font-bold truncate',
              themeUtils.baseTheme === 'light' ? 'text-dark-800' : 'text-white'
            )}>
            {value}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
