/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type React from 'react';

import { useState } from 'react';
import { PublicInfoSection } from './PublicInfoSection';
import { Star, ThumbsDown, ThumbsUp, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface PublicStoreStatsProps {
  seller: any;
  theme?: any;
}

export function PublicStoreStats({ seller, theme }: PublicStoreStatsProps) {
  const { rating, credits } = seller.store;
  // Use the centralized theme utility
  const themeUtils = useThemeUtils(theme);

  const totalProducts = 0; // temporary
  const totalSales = 0; // temporary
  const totalCredits = credits.positive + credits.negative;
  const positivePercentage =
    totalCredits > 0 ? Math.round((credits.positive / totalCredits) * 100) : 0;

  return (
    <PublicInfoSection title="สถิติร้าน" icon={<TrendingUp className="w-4 h-4" />} theme={theme}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<Package className="h-6 w-6" />}
            label="สินค้า"
            value={totalProducts}
            color="blue"
            theme={theme}
          />
          <StatItem
            icon={<ShoppingCart className="h-6 w-6" />}
            label="ขายแล้ว(ชิ้น)"
            value={totalSales}
            color="fuchsia"
            theme={theme}
          />
        </div>

        <div
          className={cn(
            'space-y-4 pt-5 border-t',
            themeUtils.baseTheme === 'light' ? 'border-light-400/50' : 'border-dark-300/50'
          )}>
          <StatItem
            icon={<Star className="h-4 w-4 fill-yellow-400" />}
            label="คะแนนร้าน"
            value={rating.toFixed(1)}
            color="yellow"
            theme={theme}>
            <div
              className={cn(
                'h-1.5 w-full rounded-full overflow-hidden mt-2',
                themeUtils.baseTheme === 'light' ? 'bg-light-300' : 'bg-background'
              )}>
              <div
                className="h-full bg-yellow-400 transition-all duration-1000"
                style={{ width: `${(rating / 5) * 100}%` }}
              />
            </div>
          </StatItem>

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
                {totalCredits} reviews
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <StatItem
                icon={<ThumbsUp className="h-6 w-6" />}
                label="บวก"
                value={credits.positive}
                color="green"
                theme={theme}
              />
              <StatItem
                icon={<ThumbsDown className="h-6 w-6" />}
                label="ลบ"
                value={credits.negative}
                color="red"
                theme={theme}
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
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'emerald' | 'yellow' | 'green' | 'red' | 'fuchsia';
  children?: React.ReactNode;
  theme?: any;
}

function StatItem({ icon, label, value, color = 'blue', children, theme }: StatItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const themeUtils = useThemeUtils(theme);

  const colorStyles = {
    blue: 'hover:border-blue-400/50 hover:via-blue-400/20 via-blue-400/5 text-blue-500',
    purple: 'hover:border-purple-400/50 hover:via-purple-400/20 via-purple-400/5 text-purple-500',
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
        'group border-[0.5px] p-2 from-5% via-55% to-100% transition-all duration-500 cursor-default rounded-xl',
        'bg-gradient-to-tr from-transparent to-transparent',
        themeUtils.baseTheme === 'light' ? 'border-light-300' : 'border-transparent',
        colorStyles[color]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center gap-2">
        <div className={cn('transition-transform duration-300', isHovered ? 'scale-110' : '')}>
          {icon}
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
