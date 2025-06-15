'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2, ShoppingBag, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useStoreReviews } from '@/hooks/useStoreCredits';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import type { ThemeType } from '@/types';

interface StoreReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  storeName: string;
  theme: ThemeType | null;
}

export const StoreReviewModal: React.FC<StoreReviewModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  storeName,
  theme,
}) => {
  const themeUtils = useThemeUtils(theme);
  const { isAuthenticated } = useBuyerAuth();
  const { error, submitReview } = useStoreReviews(sellerId);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLight = themeUtils.baseTheme === 'light';

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      setSubmitError('กรุณาให้คะแนนและเขียนความคิดเห็น');
      return;
    }

    if (comment.trim().length < 10) {
      setSubmitError('ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitReview(rating, comment.trim());
      onClose();
      // Reset form
      setRating(0);
      setComment('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'ไม่สามารถส่งรีวิวได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      setSubmitError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

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
              <h2 className="text-lg font-semibold">รีวิวร้านค้า</h2>
              <p className="text-sm opacity-70">{storeName}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                'p-2 rounded-full transition-colors',
                isLight ? 'hover:bg-gray-100' : 'hover:bg-gray-800',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}>
              <X size={20} />
            </button>
          </div>

          {/* Authentication Check */}
          {!isAuthenticated ? (
            <div className="text-center space-y-4">
              <LogIn size={48} className="mx-auto opacity-60" />
              <div>
                <h3 className="font-medium mb-2">เข้าสู่ระบบเพื่อรีวิว</h3>
                <p className="text-sm opacity-70">
                  คุณต้องเข้าสู่ระบบก่อนถึงจะสามารถรีวิวร้านค้าได้
                </p>
              </div>
              <button
                onClick={handleClose}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  themeUtils.getButtonClass()
                )}>
                ปิด
              </button>
            </div>
          ) : (
            <>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">เรตติ้ง</label>
                <div className="flex gap-1 justify-center">
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
                        size={32}
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
                {rating > 0 && (
                  <p className="text-center text-sm mt-2 opacity-70">
                    {rating === 1 && 'แย่มาก'}
                    {rating === 2 && 'แย่'}
                    {rating === 3 && 'ปานกลาง'}
                    {rating === 4 && 'ดี'}
                    {rating === 5 && 'ยอดเยี่ยม'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">แบ่งปันประสบการณ์ของคุณ</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เล่าให้ฟังเกี่ยวกับการบริการ คุณภาพสินค้า และประสบการณ์โดยรวมกับร้านนี้..."
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
                  <p className="text-xs opacity-60">อย่างน้อย 10 ตัวอักษร</p>
                  <p className="text-xs opacity-60">{comment.length}/1000</p>
                </div>
              </div>

              {/* Error Display */}
              {(submitError || error) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {submitError || error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={cn(
                    'flex-1 px-4 py-2 text-sm font-medium border rounded-lg transition-colors',
                    themeUtils.getCardClass(),
                    'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}>
                  ยกเลิก
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
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      ส่งรีวิว
                    </>
                  )}
                </button>
              </div>

              {/* Purchase Requirement Note */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg">
                <div className="flex items-start gap-2">
                  <ShoppingBag size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">หมายเหตุ:</p>
                    <p>คุณสามารถรีวิวได้เฉพาะร้านค้าที่คุณเคยซื้อสินค้าแล้วเท่านั้น</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
