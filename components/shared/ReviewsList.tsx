'use client';

import React from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { ReviewCard } from './ReviewCard';
import type { ThemeType } from '@/types';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  theme: ThemeType | null;
  className?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading,
  hasMore,
  onLoadMore,
  theme,
  className,
}) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  if (reviews.length === 0 && !isLoading) {
    return (
      <div
        className={cn(
          'p-8 border rounded-lg text-center',
          isLight
            ? 'bg-light-50 border-light-200 text-dark-600'
            : 'bg-dark-800/50 border-dark-600 text-light-400',
          themeUtils.getComponentRoundednessClass(),
          className
        )}>
        <p className="text-lg font-medium mb-2">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
        <p className="text-sm opacity-70">เป็นคนแรกที่รีวิวสินค้านี้หลังจากการซื้อ</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} theme={theme} />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin opacity-60" />
          <span className="ml-2 text-sm opacity-60">กำลังโหลดรีวิว...</span>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 hover:scale-105',
              isLight
                ? 'bg-light-100 border-light-300 text-dark-700 hover:bg-light-200'
                : 'bg-dark-700 border-dark-500 text-light-300 hover:bg-dark-600'
            )}>
            <ChevronDown size={16} />
            <span className="text-sm font-medium">โหลดรีวิวเพิ่มเติม</span>
          </button>
        </div>
      )}

      {/* End Message */}
      {!hasMore && reviews.length > 0 && !isLoading && (
        <div className="text-center py-4">
          <p className={cn('text-sm opacity-60', isLight ? 'text-dark-500' : 'text-light-500')}>
            แสดงรีวิวทั้งหมดแล้ว ({reviews.length} รีวิว)
          </p>
        </div>
      )}
    </div>
  );
};
