'use client';

import React from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface StoreRatingStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    recentReviews?: Array<{
      _id: string;
      rating: number;
      comment: string;
      createdAt: string;
      productId?: {
        title: string;
      };
    }>;
  };
  theme: ThemeType | null;
  className?: string;
}

export const StoreRatingStats: React.FC<StoreRatingStatsProps> = ({ stats, theme, className }) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const { averageRating, totalReviews, recentReviews = [] } = stats;

  const getRatingLevel = (rating: number) => {
    if (rating >= 4.5) return { label: 'ยอดเยี่ยม', color: 'text-green-500', icon: Award };
    if (rating >= 4.0) return { label: 'ดีมาก', color: 'text-blue-500', icon: TrendingUp };
    if (rating >= 3.5) return { label: 'ดี', color: 'text-yellow-500', icon: Star };
    if (rating >= 3.0) return { label: 'ปานกลาง', color: 'text-orange-500', icon: Users };
    return { label: 'ต้องปรับปรุง', color: 'text-red-500', icon: Users };
  };

  const ratingLevel = getRatingLevel(averageRating);
  const IconComponent = ratingLevel.icon;

  if (totalReviews === 0) {
    return (
      <div
        className={cn(
          'p-6 border rounded-lg text-center',
          themeUtils.getComponentRoundednessClass(),
          themeUtils.getCardClass(),
          className
        )}>
        <Star size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm font-medium mb-1">ยังไม่มีรีวิวสำหรับร้านนี้</p>
        <p className="text-xs opacity-70">เป็นคนแรกที่รีวิวสินค้าจากร้านนี้</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 border rounded-lg space-y-5',
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getCardClass(),
        className
      )}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">เรตติ้ง</h3>
        <div className={cn('flex items-center gap-1', ratingLevel.color)}>
          <IconComponent size={16} />
          <span className="text-sm font-medium">{ratingLevel.label}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                fill={averageRating >= star ? '#fbbf24' : 'none'}
                stroke="#fbbf24"
                className="text-amber-400"
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="opacity-60" />
            <span>จาก {totalReviews} รีวิว</span>
          </div>
          <div className="mt-2">
            <div className={cn('h-2 rounded-full', isLight ? 'bg-light-200' : 'bg-dark-600')}>
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(averageRating / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {recentReviews.length > 0 && (
        <div className="space-y-5">
          <h4 className="text-sm font-medium opacity-80">รีวิวล่าสุด</h4>
          <div className="space-y-2">
            {recentReviews.slice(0, 2).map((review) => (
              <div
                key={review._id}
                className={cn(
                  'p-3 rounded-lg text-xs',
                  isLight ? 'bg-light-100' : 'bg-dark-700/50'
                )}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        fill={review.rating >= star ? '#fbbf24' : 'none'}
                        stroke="#fbbf24"
                        className="text-amber-400"
                      />
                    ))}
                  </div>
                  {review.productId?.title && (
                    <span className="opacity-60 truncate max-w-[100px]">
                      {review.productId.title}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 opacity-80">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          'grid grid-cols-2 gap-3 pt-3 border-t',
          isLight ? 'border-light-300' : 'border-dark-400'
        )}>
        <div className="text-center">
          <div className="text-lg font-semibold">{totalReviews}</div>
          <div className="text-xs opacity-60">รีวิวทั้งหมด</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">
            {totalReviews > 0 ? Math.round((averageRating / 5) * 100) : 0}%
          </div>
          <div className="text-xs opacity-60">ความพึงพอใจ</div>
        </div>
      </div>
    </div>
  );
};
