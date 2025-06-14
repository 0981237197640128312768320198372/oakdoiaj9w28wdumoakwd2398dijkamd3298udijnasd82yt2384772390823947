'use client';

import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

// Define proper TypeScript interfaces for better type safety
interface RatingDistributionData {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistributionData;
}

interface RatingDistributionProps {
  stats: ReviewStats | null | undefined;
  theme: ThemeType | null;
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  stats,
  theme,
  className,
}) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  // Memoize the processed stats to avoid recalculation on every render
  const processedStats = useMemo(() => {
    // Add debugging to see what we're receiving
    console.log('RatingDistribution - Raw stats received:', stats);

    // Handle null/undefined stats
    if (!stats || typeof stats !== 'object') {
      console.log('RatingDistribution - Stats is null/undefined or not an object');
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        } as RatingDistributionData,
      };
    }

    // Safely extract values with proper defaults
    const averageRating = typeof stats.averageRating === 'number' ? stats.averageRating : 0;
    const totalReviews = typeof stats.totalReviews === 'number' ? stats.totalReviews : 0;

    console.log('RatingDistribution - Extracted values:', { averageRating, totalReviews });

    // Handle ratingDistribution with comprehensive validation
    const ratingDistribution: RatingDistributionData = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    console.log('RatingDistribution - Raw ratingDistribution:', stats.ratingDistribution);

    if (stats.ratingDistribution && typeof stats.ratingDistribution === 'object') {
      // Handle both string and numeric keys from the API
      const apiData = stats.ratingDistribution as unknown as Record<string | number, number>;

      for (let i = 1; i <= 5; i++) {
        const stringKey = i.toString() as keyof RatingDistributionData;

        // Check for string key first, then numeric key
        if (typeof apiData[stringKey] === 'number') {
          ratingDistribution[stringKey] = apiData[stringKey];
          console.log(`RatingDistribution - Set ${stringKey} from string key:`, apiData[stringKey]);
        } else if (typeof apiData[i] === 'number') {
          ratingDistribution[stringKey] = apiData[i];
          console.log(`RatingDistribution - Set ${stringKey} from numeric key:`, apiData[i]);
        }
      }
    }

    const result = {
      averageRating,
      totalReviews,
      ratingDistribution,
    };

    console.log('RatingDistribution - Final processed stats:', result);
    return result;
  }, [stats]);

  const { averageRating, totalReviews } = processedStats;

  // Early return for no reviews case
  if (totalReviews === 0) {
    return (
      <div
        className={cn(
          'p-6 border rounded-lg text-center',
          isLight
            ? 'bg-light-50 border-light-200 text-dark-600'
            : 'bg-dark-800/50 border-dark-600 text-light-400',
          themeUtils.getComponentRoundednessClass(),
          className
        )}>
        <Star size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-xs">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-6 border rounded-lg space-y-4 ',
        isLight
          ? 'bg-light-50 border-light-200 text-dark-800'
          : 'bg-dark-800/50 border-dark-600 text-light-200',
        themeUtils.getComponentRoundednessClass(),
        className
      )}>
      {/* Overall Rating */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                fill={averageRating >= star ? '#fbbf24' : 'none'}
                stroke="#fbbf24"
                className="text-amber-400"
              />
            ))}
          </div>
        </div>
        <p className={cn('text-xs', isLight ? 'text-dark-600' : 'text-light-400')}>
          จาก {totalReviews.toLocaleString()} รีวิว
        </p>
      </div>

      {/* Additional Stats (Optional) */}
      {totalReviews > 0 && (
        <div
          className={cn(
            'pt-4 border-t text-center',
            isLight ? 'border-light-200' : 'border-dark-600'
          )}>
          <div className="flex justify-center items-center gap-4 text-xs">
            <div
              className={cn(
                'flex items-center gap-1',
                isLight ? 'text-dark-500' : 'text-light-400'
              )}>
              <span>คะแนนเฉลี่ย:</span>
              <span className="font-semibold">{averageRating.toFixed(2)}/5.0</span>
            </div>
            <div className={cn('w-px h-4', isLight ? 'bg-light-300' : 'bg-dark-600')} />
            <div
              className={cn(
                'flex items-center gap-1',
                isLight ? 'text-dark-500' : 'text-light-400'
              )}>
              <span>รีวิวทั้งหมด:</span>
              <span className="font-semibold">{totalReviews.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
