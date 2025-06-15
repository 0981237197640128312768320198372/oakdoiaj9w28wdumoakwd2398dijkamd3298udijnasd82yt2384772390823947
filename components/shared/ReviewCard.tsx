'use client';

import React from 'react';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import type { ThemeType } from '@/types';

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    buyerId?: {
      name?: string;
      email?: string;
    };
  };
  theme: ThemeType | null;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, theme, className }) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
    } catch (error) {
      return dateString;
    }
  };

  const getBuyerDisplayName = () => {
    if (review.buyerId?.name) {
      return review.buyerId.name;
    }
    if (review.buyerId?.email) {
      const emailParts = review.buyerId.email.split('@');
      return emailParts[0].substring(0, 3) + '***';
    }
    return 'ผู้ซื้อ';
  };

  return (
    <div
      className={cn(
        'p-4 border rounded-lg space-y-5',
        isLight
          ? 'bg-light-50 border-light-200 text-dark-800'
          : 'bg-dark-800/50 border-dark-600 text-light-200',
        themeUtils.getComponentRoundednessClass(),
        className
      )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isLight ? 'bg-light-200' : 'bg-dark-700'
            )}>
            <User size={16} className="opacity-60" />
          </div>
          <div>
            <p className="text-sm font-medium">{getBuyerDisplayName()}</p>
            <p className={cn('text-xs', isLight ? 'text-dark-500' : 'text-light-500')}>
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              fill={review.rating >= star ? '#fbbf24' : 'none'}
              stroke="#fbbf24"
              className="text-amber-400"
            />
          ))}
          <span className="text-sm font-medium ml-1">{review.rating}</span>
        </div>
      </div>

      {/* Comment */}
      <div
        className={cn(
          'text-sm leading-relaxed p-3 rounded-lg',
          isLight ? 'bg-light-100' : 'bg-dark-700/50'
        )}>
        {review.comment}
      </div>
    </div>
  );
};
