/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { InfoSection } from './InfoSection';
import { Star, ThumbsDown, ThumbsUp, TrendingUp, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoreCredits } from '@/hooks/useStoreCredits';

interface StoreStatsProps {
  seller: any;
}

export function StoreStats({ seller }: StoreStatsProps) {
  const { stats: storeCreditStats } = useStoreCredits(seller?._id || null);

  const { rating } = seller.store;
  const totalProducts = 0; // temporary
  const totalSales = 0; // temporary

  // Use real store credit data
  const positiveCredits = storeCreditStats?.positiveCount || 0;
  const negativeCredits = storeCreditStats?.negativeCount || 0;
  const totalCredits = positiveCredits + negativeCredits;
  const positivePercentage =
    totalCredits > 0 ? Math.round((positiveCredits / totalCredits) * 100) : 0;

  return (
    <InfoSection
      title="สถิติร้าน"
      icon={<TrendingUp className="h-4 w-4" />}
      className="bg-dark-700 border-[1px] border-dark-500">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            icon={<Package className="h-5 w-5" />}
            label="Products"
            value={totalProducts}
            color="blue"
          />
          <StatItem
            icon={<ShoppingCart className="h-5 w-5" />}
            label="Sales"
            value={totalSales}
            color="fuchsia"
          />
        </div>

        <div className="space-y-3 pt-3 border-t border-dark-300/50">
          <StatItem
            icon={<Star className="h-4 w-4 fill-yellow-400" />}
            label="Store Rating"
            value={rating.toFixed(1)}
            color="yellow">
            <div className="h-1 w-full bg-background rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-yellow-400 transition-all duration-1000"
                style={{ width: `${(rating / 5) * 100}%` }}
              />
            </div>
          </StatItem>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Customer Satisfaction</p>
              <p className="text-xs text-muted-foreground">{totalCredits} reviews</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <StatItem
                icon={<ThumbsUp className="h-5 w-5" />}
                label="Positive"
                value={positiveCredits}
                color="green"
              />
              <StatItem
                icon={<ThumbsDown className="h-5 w-5" />}
                label="Negative"
                value={negativeCredits}
                color="red"
              />
            </div>
            <div className="relative h-1 w-full bg-background rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${positivePercentage}%` }}
              />
            </div>
            <p className="text-xs font-medium mt-1">{positivePercentage}% ระดับความพอใจ</p>
          </div>
        </div>
      </div>
    </InfoSection>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'emerald' | 'yellow' | 'green' | 'red' | 'fuchsia';
  children?: React.ReactNode;
}

function StatItem({ icon, label, value, color = 'blue', children }: StatItemProps) {
  const [isHovered, setIsHovered] = useState(false);

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
        'group rounded-md border-[0.5px] border-transparent p-2',
        'bg-gradient-to-tr from-transparent to-transparent from-5% via-55% to-100%',
        'transition-all duration-500 cursor-default',
        colorStyles[color]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center gap-2">
        <div className={cn('transition-transform duration-300', isHovered ? 'scale-110' : '')}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold truncate">{value}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
