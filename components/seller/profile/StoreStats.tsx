/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { InfoSection } from './InfoSection';
import {
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreStatsProps {
  seller: any;
}

export function StoreStats({ seller }: StoreStatsProps) {
  const { rating, credits } = seller.store;

  const totalProducts = 0; // temporary
  const totalSales = 0; // temporary
  const totalCredits = credits.positive + credits.negative;
  const positivePercentage =
    totalCredits > 0 ? Math.round((credits.positive / totalCredits) * 100) : 0;

  return (
    <InfoSection
      title="Store Statistics"
      icon={<TrendingUp className="h-5 w-5" />}
      className="bg-primary/5">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<Package className="h-6 w-6" />}
            label="Products"
            value={totalProducts}
            color="blue"
          />
          <StatItem
            icon={<ShoppingCart className="h-6 w-6" />}
            label="Sales"
            value={totalSales}
            color="fuchsia"
          />
        </div>

        <div className="space-y-4 pt-5 border-t border-dark-300/50">
          <StatItem
            icon={<Star className="h-4 w-4 fill-yellow-400" />}
            label="Store Rating"
            value={rating.toFixed(1)}
            color="yellow">
            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden mt-2">
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
            <div className="grid grid-cols-2 gap-4 mb-3">
              <StatItem
                icon={<ThumbsUp className="h-6 w-6" />}
                label="Positive"
                value={credits.positive}
                color="green"
              />
              <StatItem
                icon={<ThumbsDown className="h-6 w-6" />}
                label="Negative"
                value={credits.negative}
                color="red"
              />
            </div>
            <div className="relative h-1.5 w-full bg-background rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${positivePercentage}%` }}
              />
            </div>
            <p className="text-xs font-medium mt-1">{positivePercentage}% satisfaction rate</p>
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
