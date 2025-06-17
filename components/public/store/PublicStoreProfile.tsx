/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Info, MessageCircle, Star, Edit3, ChevronDown, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PublicInfoSection } from './PublicInfoSection';
import { useThemeUtils } from '@/lib/theme-utils';
import { PublicStoreHeader } from './PublicStoreHeader';
import { PublicStoreStats } from './PublicStoreStats';
import { useStoreCredits, useStoreReviews } from '@/hooks/useStoreCredits';
import { StoreReviewModal } from '@/components/shared/StoreReviewModal';
import { StoreRatingStats } from '@/components/shared/StoreRatingStats';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { useBuyerAuth } from '@/context/BuyerAuthContext';
import { useSellerStats } from '@/hooks/useSellerStats';
import { SocialLinks } from '@/components/Private/seller/profile/SocialLinks';

interface PublicStoreProfileProps {
  seller: any;
  theme: any;
}

const PublicStoreProfile: React.FC<PublicStoreProfileProps> = ({ seller, theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { isAuthenticated } = useBuyerAuth();

  const {
    stats: storeCreditStats,
    purchaseInfo,
    submitCredit,
  } = useStoreCredits(seller?._id || null);
  const {
    stats: storeReviewStats,
    reviews,
    isLoading: reviewsLoading,
    isLoadingMore,
    hasMore,
    fetchReviewsList,
    loadMore,
  } = useStoreReviews(seller?._id || null);
  const {
    statistics: sellerStats,
    isLoading: statsLoading,
    error: statsError,
  } = useSellerStats(seller?.username || null);

  const themeUtils = useThemeUtils(theme);

  const getProfileStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      card: isLight ? 'bg-white text-dark-800' : 'bg-card text-card-foreground',
      infoSection: isLight ? 'bg-light-50/50' : 'bg-dark-800/30',
      text: isLight ? 'text-dark-800' : 'text-light-100',
      secondaryText: isLight ? 'text-dark-600' : 'text-muted-foreground',
    };
  };

  const profileStyles = getProfileStyles();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load reviews when component mounts
  useEffect(() => {
    if (seller?._id) {
      fetchReviewsList(1, true);
    }
  }, [seller?._id, fetchReviewsList]);

  if (!seller) {
    return (
      <Card
        className={cn(
          'w-full max-w-4xl opacity-0 transition-opacity duration-500',
          themeUtils.getCardClass()
        )}>
        <CardContent className="text-center p-4">
          <p className={cn('text-xs', profileStyles.secondaryText)}>ข้อมูลร้านไม่สามารถใช้งานได้</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
    } catch (error) {
      return dateString;
    }
  };

  // Check if user can write review (authenticated + has purchased)
  const canWriteReview = isAuthenticated && purchaseInfo?.hasPurchased;

  return (
    <>
      <div
        className={cn(
          'w-full min-h-[70vh] transition-all duration-500 transform ',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          themeUtils.getTextColors()
        )}>
        <Card className="overflow-hidden">
          <PublicStoreHeader
            seller={seller}
            theme={theme}
            storeCreditStats={storeCreditStats}
            sellerStats={sellerStats}
            storeReviewStats={storeReviewStats}
          />
          <CardContent className="p-5 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <PublicInfoSection
                  title="ข้อมูลร้านค้า"
                  theme={theme}
                  icon={<Info className="w-3 h-3" />}>
                  <div
                    className={cn(
                      'p-3 rounded-md text-xs leading-relaxed',
                      profileStyles.infoSection
                    )}>
                    {seller.store.description || 'ไม่มีคำอธิบายร้านค้า'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className={cn('h-3 w-3', profileStyles.secondaryText)} />
                      <span className={cn('text-xs', profileStyles.secondaryText)}>
                        เป็นสมาชิกตั้งแต่
                      </span>
                      <span className={cn('font-medium text-xs', profileStyles.text)}>
                        {formatDate(seller.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className={cn('h-3 w-3', profileStyles.secondaryText)} />
                      <span className={cn('text-xs', profileStyles.secondaryText)}>
                        อัพเดทล่าสุด
                      </span>
                      <span className={cn('font-medium text-xs', profileStyles.text)}>
                        {formatDate(seller.updatedAt)}
                      </span>
                    </div>
                  </div>
                </PublicInfoSection>

                {storeReviewStats && <StoreRatingStats stats={storeReviewStats} theme={theme} />}
                {canWriteReview && (
                  <div
                    className={cn(
                      'p-4 border transition-all duration-300',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass()
                    )}>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={cn(
                          'p-1 border',
                          themeUtils.getCardClass(),
                          themeUtils.getComponentRoundednessClass()
                        )}>
                        <Edit3 className="w-3 h-3" />
                      </div>
                      <h3 className="text-xs font-aktivGroteskBlack tracking-widest">
                        รีวิวร้านค้า
                      </h3>
                    </div>

                    <button
                      onClick={() => setShowReviewModal(true)}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium text-xs transition-all duration-200 mb-4',
                        themeUtils.getButtonClass()
                      )}>
                      <Edit3 size={12} />
                      เขียนรีวิวร้านค้า
                    </button>

                    {!canWriteReview && (
                      <div
                        className={cn(
                          'text-center p-3 rounded-md text-xs opacity-70 mb-4',
                          profileStyles.infoSection
                        )}>
                        {!isAuthenticated
                          ? 'เข้าสู่ระบบเพื่อเขียนรีวิว'
                          : 'ซื้อสินค้าจากร้านนี้ก่อนเพื่อเขียนรีวิว'}
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-5">
                      {reviewsLoading && reviews.length === 0 ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 size={16} className="animate-spin opacity-60" />
                          <span className="ml-2 text-xs opacity-60">กำลังโหลดรีวิว...</span>
                        </div>
                      ) : reviews.length > 0 ? (
                        <>
                          {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} theme={theme} />
                          ))}

                          {/* Load More Button */}
                          {hasMore && (
                            <div className="flex justify-center pt-2">
                              <button
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 text-xs',
                                  profileStyles.infoSection,
                                  'hover:opacity-80 disabled:opacity-50'
                                )}>
                                {isLoadingMore ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <ChevronDown size={12} />
                                )}
                                <span>{isLoadingMore ? 'กำลังโหลด...' : 'โหลดรีวิวเพิ่มเติม'}</span>
                              </button>
                            </div>
                          )}

                          {/* End Message */}
                          {!hasMore && reviews.length > 0 && (
                            <div className="text-center py-3">
                              <p className={cn('text-xs opacity-60', profileStyles.secondaryText)}>
                                แสดงรีวิวทั้งหมดแล้ว ({reviews.length} รีวิว)
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className={cn('text-center p-6 rounded-md', profileStyles.infoSection)}>
                          <p className="text-xs opacity-70">ยังไม่มีรีวิวสำหรับร้านนี้</p>
                          <p className="text-xs opacity-50 mt-1">
                            เป็นคนแรกที่รีวิวร้านนี้หลังจากการซื้อ
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <PublicStoreStats
                  theme={theme}
                  seller={seller}
                  storeCreditStats={storeCreditStats}
                  isAuthenticated={isAuthenticated}
                  purchaseInfo={purchaseInfo}
                  onSubmitCredit={submitCredit}
                />

                <PublicInfoSection
                  theme={theme}
                  title="ข้อมูลการติดต่อ"
                  icon={<MessageCircle className="w-3 h-3" />}>
                  <SocialLinks contact={seller.contact} />
                </PublicInfoSection>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Review Modal */}
      <StoreReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          fetchReviewsList(1, true);
        }}
        sellerId={seller._id}
        storeName={seller.store.name}
        theme={theme}
      />
    </>
  );
};

export default PublicStoreProfile;
