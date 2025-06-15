'use client';

import React from 'react';
import { Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import type { ThemeType } from '@/types';
import Image from 'next/image';

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    // Denormalized buyer data (new approach)
    buyerName?: string;
    buyerEmail?: string;
    buyerAvatarUrl?: string;
    // Legacy populated buyer data (for backward compatibility)
    buyerId?: {
      _id?: string;
      name?: string;
      email?: string;
      avatarUrl?: string;
    };
    buyerPurchaseCount?: number;
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
    // Use denormalized buyer data first (new approach)
    if (review.buyerName) {
      return review.buyerName;
    }
    // Fallback to populated buyer data (legacy)
    if (review.buyerId?.name) {
      return review.buyerId.name;
    }
    // Use email as fallback
    const email = review.buyerEmail || review.buyerId?.email;
    if (email) {
      const emailParts = email.split('@');
      return emailParts[0].substring(0, 3) + '***';
    }
    return 'ผู้ซื้อ';
  };

  const getBuyerAvatarUrl = () => {
    // Use denormalized buyer data first (new approach)
    if (review.buyerAvatarUrl) {
      return review.buyerAvatarUrl;
    }
    // Fallback to populated buyer data (legacy)
    return review.buyerId?.avatarUrl;
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
          {/* Avatar */}
          <div className="relative">
            {getBuyerAvatarUrl() ? (
              <Image
                src={getBuyerAvatarUrl()!}
                alt={getBuyerDisplayName()}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                isLight ? 'bg-light-200' : 'bg-dark-700',
                getBuyerAvatarUrl() ? 'hidden' : ''
              )}>
              <User size={16} className="opacity-60" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{getBuyerDisplayName()}</p>
              {/* Purchase History Badge */}
              {review.buyerPurchaseCount && review.buyerPurchaseCount > 0 && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    isLight
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-green-900/30 text-green-400 border border-green-700/50'
                  )}>
                  {review.buyerPurchaseCount === 1
                    ? 'ซื้อ 1 ครั้ง'
                    : `ซื้อ ${review.buyerPurchaseCount} ครั้ง`}
                </span>
              )}
            </div>
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
