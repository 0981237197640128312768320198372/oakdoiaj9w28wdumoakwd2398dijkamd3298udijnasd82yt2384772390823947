/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Star, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';

interface ReviewsSummaryProps {
  seller: any;
  ratingStats?: {
    averageRating: number;
    totalReviews: number;
  } | null;
  reviews?: Array<{
    _id: string;
    rating: number;
    comment: string;
    createdAt: string;
    buyerName?: string;
    buyerEmail?: string;
    buyerAvatarUrl?: string;
    buyerId?: {
      name?: string;
      email?: string;
    };
  }>;
  isLoading?: boolean;
}

export function ReviewsSummary({
  seller,
  ratingStats,
  reviews = [],
  isLoading,
}: ReviewsSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-center py-8">
          <Loader2 className="w-4 h-4 animate-spin text-light-400 mx-auto mb-2" />
          <p className="text-xs text-light-500">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (!ratingStats || ratingStats.totalReviews === 0) {
    return (
      <div className="space-y-2">
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 text-light-600 mx-auto mb-2" />
          <p className="text-xs text-light-500 mb-1">No reviews yet</p>
          <p className="text-xs text-light-600">
            Reviews will appear here once customers start reviewing your store
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Rating Overview */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-white">
              {ratingStats.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-light-400">/5</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-light-400">
            <MessageSquare className="w-3 h-3" />
            <span>{ratingStats.totalReviews} reviews</span>
          </div>
        </div>

        {/* Rating Bar */}
        <div className="w-full bg-dark-700 rounded-full h-1.5">
          <div
            className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(ratingStats.averageRating / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-light-300 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Recent Reviews
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="bg-dark-800 border border-dark-700 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-dark-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-light-400">
                    {review.buyerName || review.buyerId?.name || 'Anonymous'}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-xs text-light-300 line-clamp-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
