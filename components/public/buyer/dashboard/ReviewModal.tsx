'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';

interface PendingReview {
  _id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  orderTotal: number;
  createdAt: string;
  sellerId: {
    store: {
      name: string;
      logoUrl?: string;
    };
  };
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: PendingReview[];
  theme: ThemeType | null;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
  onSubmitReview: (data: {
    orderId: string;
    rating: number;
    comment: string;
    reviewType: 'product';
    buyerId: string;
    buyerName: string;
    buyerEmail?: string;
    buyerAvatarUrl?: string;
  }) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  pendingReviews,
  theme,
  buyerId,
  buyerName,
  buyerEmail,
  buyerAvatarUrl,
  onSubmitReview,
}) => {
  const themeUtils = useThemeUtils(theme);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentReview = pendingReviews[currentReviewIndex];
  const isLastReview = currentReviewIndex === pendingReviews.length - 1;

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      setError('Please provide both rating and comment');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitReview({
        orderId: currentReview.orderId,
        rating,
        comment: comment.trim(),
        reviewType: 'product',
        buyerId,
        buyerName,
        buyerEmail,
        buyerAvatarUrl,
      });

      if (isLastReview) {
        onClose();
      } else {
        setCurrentReviewIndex(currentReviewIndex + 1);
        setRating(0);
        setComment('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (isLastReview) {
      onClose();
    } else {
      setCurrentReviewIndex(currentReviewIndex + 1);
      setRating(0);
      setComment('');
      setError(null);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    setCurrentReviewIndex(0);
    onClose();
  };

  if (!isOpen || !currentReview) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'w-full max-w-md p-6 border backdrop-blur-sm',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass(),
            themeUtils.getComponentShadowClass()
          )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Review Product</h2>
              <p className="text-sm opacity-70">
                Product {currentReviewIndex + 1} of {pendingReviews.length}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                'p-2 rounded-full transition-colors',
                themeUtils.baseTheme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}>
              <X size={20} />
            </button>
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h3 className="font-medium text-sm mb-2">{currentReview.productTitle}</h3>
            <p className="text-xs opacity-70">From: {currentReview.sellerId.store.name}</p>
            <p className="text-xs opacity-70">
              Order Total: {currentReview.orderTotal} Dokmai Coins
            </p>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              How would you rate this product?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                  className={cn(
                    'p-1 transition-transform hover:scale-110',
                    isSubmitting && 'cursor-not-allowed opacity-50'
                  )}>
                  <Star
                    size={24}
                    className={cn(
                      'transition-colors',
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Share your experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience with this product..."
              rows={4}
              disabled={isSubmitting}
              className={cn(
                'w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all',
                themeUtils.getCardClass(),
                'focus:ring-blue-500',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs opacity-60">Minimum 10 characters</p>
              <p className="text-xs opacity-60">{comment.length}/1000</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium border rounded-lg transition-colors',
                themeUtils.getCardClass(),
                'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
              )}>
              {isLastReview ? 'Close' : 'Skip'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !rating || comment.trim().length < 10}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2',
                themeUtils.getButtonClass(),
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Review
                </>
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  themeUtils.getPrimaryColorClass('bg')
                )}
                style={{
                  width: `${((currentReviewIndex + 1) / pendingReviews.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
