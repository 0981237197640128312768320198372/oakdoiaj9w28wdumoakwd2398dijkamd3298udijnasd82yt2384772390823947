/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Info,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import QuantityControls from './QuantityControls';
import { Product, Category, ThemeType } from '@/types';
import { cn, dokmaiCoinSymbol, dokmaiImagePlaceholder, formatPrice } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import RelatedProducts from './RelatedProducts';
import { useProductReviews } from '@/hooks/useReviews';
import { RatingDistribution } from '@/components/shared/RatingDistribution';
import { ReviewsList } from '@/components/shared/ReviewsList';

interface ProductDetailProps {
  product: Product;
  category?: Category;
  categories?: Category[];
  theme: ThemeType;
  onBack: () => void;
  onBuyNow: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  sellerId?: string;
  isLoading?: boolean;
}

export default function ProductDetail({
  product,
  category,
  categories = [],
  theme,
  onBack,
  onBuyNow,
  onViewDetails,
  sellerId,
  isLoading = false,
}: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description'
  );

  // Fetch product reviews and stats
  const {
    reviews,
    stats: reviewStats,
    isLoading: reviewsLoading,
    hasMore,
    loadMore,
  } = useProductReviews(product._id);

  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const imagePlaceholder = dokmaiImagePlaceholder(isLight);
  const currentImage =
    product.images.length > 0 ? product.images[currentImageIndex] : imagePlaceholder;

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const getStyles = () => {
    return {
      container: cn(
        'w-full animate-fade-in space-y-8 pb-24 md:pb-12',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass()
      ),

      header: cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-4 md:px-6 pt-6',
        isLight ? 'text-dark-800' : 'text-light-200'
      ),
      breadcrumb: cn(
        'flex items-center text-sm gap-2 overflow-x-auto whitespace-nowrap pb-2 select-none',
        isLight ? 'text-dark-500' : 'text-light-400'
      ),
      breadcrumbSeparator: cn('text-xs opacity-50'),
      breadcrumbLink: cn(
        'hover:underline transition-colors',
        themeUtils.getPrimaryColorClass('text')
      ),
      backButton: cn(
        'flex items-center w-fit gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105',
        isLight
          ? 'bg-light-200 hover:bg-light-300 text-dark-700'
          : 'bg-dark-700 hover:bg-dark-600 text-light-300'
      ),

      mainContent: cn('grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-6'),

      imageSection: cn(
        'relative aspect-square w-full overflow-hidden rounded-xl border shadow-md',
        isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-500'
      ),
      imageWrapper: cn(
        'relative aspect-square w-full overflow-hidden',
        themeUtils.getComponentRoundednessClass()
      ),
      thumbnailContainer: cn(
        'flex gap-2 overflow-x-auto pb-2 px-1',
        'scrollbar-thin scrollbar-thumb-rounded-full',
        isLight
          ? 'scrollbar-thumb-light-400 scrollbar-track-light-200'
          : 'scrollbar-thumb-dark-400 scrollbar-track-dark-600'
      ),
      thumbnail: cn(
        'w-16 h-16 rounded-lg border cursor-pointer transition-all duration-200',
        isLight ? 'border-light-300 hover:border-primary' : 'border-dark-500 hover:border-primary'
      ),
      activeThumbnail: cn(
        'border-2 scale-105 shadow-md',
        themeUtils.getPrimaryColorClass('border')
      ),

      infoSection: cn('space-y-6', isLight ? 'text-dark-800' : 'text-light-200'),
      categoryTag: cn(
        'inline-flex items-center gap-1 px-4 py-2 text-xs font-medium',
        isLight
          ? 'bg-light-200 text-dark-600 border border-light-300'
          : 'bg-dark-600 text-light-400 border border-dark-400',
        themeUtils.getComponentRoundednessClass()
      ),
      title: cn(
        'text-2xl md:text-3xl font-bold leading-tight',
        isLight ? 'text-dark-800' : 'text-light-100'
      ),

      ratingContainer: cn(
        'flex items-center gap-2 mt-2',
        isLight ? 'text-amber-500' : 'text-amber-400'
      ),
      ratingBadge: cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-lg',
        isLight ? 'bg-amber-500/10' : 'bg-amber-500/20'
      ),
      ratingCount: cn('text-sm ml-2', isLight ? 'text-dark-500' : 'text-light-400'),

      priceContainer: cn('flex flex-col gap-1 mt-4'),
      originalPrice: cn(
        'text-sm line-through whitespace-nowrap font-thin flex gap-2 items-center opacity-60',
        isLight ? 'text-red-500' : 'text-light-500'
      ),
      discountedPrice: cn(
        'text-3xl font-bold whitespace-nowrap flex gap-2 items-center',
        isLight ? 'text-dark-800' : themeUtils.getPrimaryColorClass('text')
      ),
      regularPrice: cn(
        'text-3xl font-bold whitespace-nowrap flex gap-2 items-center',
        isLight ? 'text-dark-800' : themeUtils.getPrimaryColorClass('text')
      ),

      detailsCard: cn(
        'p-4 rounded-xl border mt-6',
        isLight ? 'bg-light-50 border-light-200' : 'bg-dark-800/50 border-dark-600'
      ),
      infoItem: cn(
        'flex items-center gap-3 text-sm py-2',
        isLight ? 'text-dark-600' : 'text-light-400'
      ),

      actionButtons: cn('flex gap-5 mt-6'),
      buyButton: cn(
        'flex-1 px-6 py-3.5 rounded-xl text-base font-medium flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md',
        themeUtils.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      secondaryButton: cn(
        'p-3.5 rounded-xl transition-all hover:scale-105 border',
        isLight
          ? 'bg-light-100 border-light-300 text-dark-600 hover:bg-light-200'
          : 'bg-dark-700 border-dark-500 text-light-400 hover:bg-dark-600'
      ),

      navButton: cn(
        'absolute top-1/2 -translate-y-1/2 p-2 rounded-full z-10 shadow-md transition-transform duration-200 hover:scale-110',
        isLight
          ? 'bg-light-200/90 text-dark-800 hover:bg-light-300'
          : 'bg-dark-700/90 text-light-200 hover:bg-dark-800'
      ),

      discountBadge: cn(
        'absolute top-4 right-4 px-3 py-1 text-sm lg:text-lg font-bold shadow-md',
        themeUtils.getPrimaryColorClass('bg'),
        themeUtils.getComponentRoundednessClass(),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),

      tabsContainer: cn(
        'flex border-b mt-8 px-4 md:px-6',
        isLight ? 'border-light-300' : 'border-dark-600'
      ),
      tab: cn(
        'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
        isLight ? 'text-dark-500 border-transparent' : 'text-light-400 border-transparent'
      ),
      activeTab: cn(
        'border-b-2',
        themeUtils.getPrimaryColorClass('text'),
        themeUtils.getPrimaryColorClass('border')
      ),
      tabContent: cn('px-4 md:px-6 py-6'),
      dokmaiCoin: dokmaiCoinSymbol(isLight),
      divider: cn('w-full h-px my-6', isLight ? 'bg-light-300' : 'bg-dark-600'),
    };
  };

  const styles = getStyles();

  if (isLoading) {
    return (
      <div className={`${styles.container} animate-pulse`}>
        {/* Header skeleton */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 w-40 bg-gray-300 rounded"></div>
        </div>

        {/* Main content skeleton */}
        <div className={styles.mainContent}>
          <div>
            <div className={styles.imageSection}>
              <div className="h-full w-full bg-gray-300"></div>
            </div>
            {/* Thumbnail skeleton */}
            {product.images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {[...Array(product.images.length)].map((_, index) => (
                  <div key={index} className={cn(styles.thumbnail, 'bg-gray-300')} />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="h-6 w-2/3 bg-gray-300 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-full bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className={styles.tabsContainer}>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Tab content skeleton */}
        <div className={styles.tabContent}>
          <div className="h-40 w-full bg-gray-300 rounded"></div>
        </div>

        {/* Related products skeleton */}
        <div className="px-4 md:px-6 mt-8">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 w-full bg-gray-300 rounded"></div>
            <div className="h-10 w-full bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}>
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <span>หน้าหลัก</span>
            <span className={styles.breadcrumbSeparator}>/</span>
            {category && (
              <>
                <span>{category.name}</span>
                <span className={styles.breadcrumbSeparator}>/</span>
              </>
            )}
            <span className="truncate max-w-[200px]">{product.title}</span>
          </div>
          <button onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={18} />
            <span>กลับไปยังสินค้าทั้งหมด</span>
          </button>
        </div>
        <div className={styles.mainContent}>
          <div>
            <motion.div
              className={styles.imageSection}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}>
              <Image
                src={currentImage}
                alt={product.title}
                fill
                className={cn(
                  'object-center w-full h-full',
                  product._stock === 0 ? 'grayscale' : ''
                )}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

              {/* Sold out overlay */}
              {product._stock === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div className="bg-red-500/20 text-red-500 border-red-500/30 border-[1px] px-6 py-3 rounded-lg font-bold text-2xl shadow-lg  rotate-12">
                    SOLD
                  </div>
                </div>
              )}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className={cn(styles.navButton, 'left-2')}
                    aria-label="Previous image">
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className={cn(styles.navButton, 'right-2')}
                    aria-label="Next image">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {hasDiscount && (
                <div className={styles.discountBadge}>ลด {product.discountPercentage}%</div>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className={styles.thumbnailContainer}>
                {product.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      styles.thumbnail,
                      index === currentImageIndex && styles.activeThumbnail
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <div className="relative w-full h-full">
                      <Image
                        src={image}
                        alt={`${product.title} - ภาพที่ ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                        sizes="64px"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.infoSection}>
            <div className="flex items-center justify-between">
              {category && (
                <div className={styles.categoryTag}>
                  {category.logoUrl ? (
                    <Image
                      src={category.logoUrl}
                      alt={category.name}
                      width={75}
                      height={75}
                      className="w-auto h-6 rounded"
                    />
                  ) : null}
                </div>
              )}
            </div>
            <h1 className={styles.title}>{product.title}</h1>
            {/* Dynamic rating display from review data */}
            <div className="flex items-center gap-3 flex-wrap">
              {reviewsLoading ? (
                <div className="flex items-center bg-gray-200 animate-pulse px-3 py-1.5 rounded-lg">
                  <div className="w-20 h-4 bg-gray-300 rounded"></div>
                </div>
              ) : reviewStats && reviewStats.averageRating > 0 ? (
                <div className={styles.ratingContainer}>
                  <div className={styles.ratingBadge}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={reviewStats.averageRating >= star ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        className="mr-0.5"
                      />
                    ))}
                    <span className="text-sm ml-1 font-medium">
                      {reviewStats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className={styles.ratingCount}>
                    (รีวิว {reviewStats.totalReviews} รายการ)
                  </span>
                </div>
              ) : null}
            </div>
            <div className={styles.priceContainer}>
              {hasDiscount ? (
                <>
                  <span className={styles.originalPrice}>
                    <Image
                      src={styles.dokmaiCoin}
                      alt="Dokmai Coin"
                      className="h-4 w-auto"
                      width={50}
                      height={50}
                    />
                    {formatPrice(product.price)}
                  </span>
                  <span className={styles.discountedPrice}>
                    <Image
                      src={styles.dokmaiCoin}
                      alt="Dokmai Coin"
                      className="h-7 w-auto"
                      width={50}
                      height={50}
                    />
                    {formatPrice(discountedPrice)}
                  </span>
                </>
              ) : (
                <span className={styles.regularPrice}>
                  <Image
                    src={styles.dokmaiCoin}
                    alt="Dokmai Coin"
                    className="h-7 w-auto"
                    width={50}
                    height={50}
                  />
                  {product.price.toFixed(2)}
                </span>
              )}
            </div>
            <div className={styles.detailsCard}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={styles.infoItem}>
                  <Package size={18} className={themeUtils.getPrimaryColorClass('text')} />
                  <span>
                    พร้อมส่ง: <strong>{product._stock} ชิ้น</strong>
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <Truck size={18} className={themeUtils.getPrimaryColorClass('text')} />
                  <span>จัดส่งทันที (ดิจิทัล)</span>
                </div>
                <div className={styles.infoItem}>
                  <ShieldCheck size={18} className={themeUtils.getPrimaryColorClass('text')} />
                  <span>รับประกันคุณภาพ 100%</span>
                </div>
                <div className={styles.infoItem}>
                  <Info size={18} className={themeUtils.getPrimaryColorClass('text')} />
                  <span>มีบริการหลังการขาย</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className={styles.actionButtons}>
                <QuantityControls
                  productId={product._id}
                  productName={product.title}
                  duration={category?.name || 'Standard'}
                  price={discountedPrice}
                  theme={theme}
                  className="w-full h-12"
                  imageUrl={product.images[0]}
                  stock={product._stock || 0}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.tabsContainer}>
          <button
            className={cn(styles.tab, activeTab === 'description' && styles.activeTab)}
            onClick={() => setActiveTab('description')}>
            รายละเอียดสินค้า
          </button>
          <button
            className={cn(styles.tab, activeTab === 'reviews' && styles.activeTab)}
            onClick={() => setActiveTab('reviews')}>
            รีวิวจากลูกค้า
          </button>
        </div>
        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <h3 className="text-xl font-semibold mb-4">รายละเอียดสินค้า</h3>
                <div
                  className={cn(
                    'text-base leading-relaxed whitespace-pre-line p-4 rounded-xl',
                    isLight ? 'bg-light-100 text-dark-700' : 'bg-dark-800/30 text-light-300'
                  )}>
                  {product.description || 'ไม่มีคำอธิบายสินค้า'}
                </div>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">รีวิวจากลูกค้า</h3>

                <RatingDistribution stats={reviewStats} theme={theme} />

                <ReviewsList
                  reviews={reviews}
                  isLoading={reviewsLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="px-4 md:px-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">สินค้าที่เกี่ยวข้อง</h3>
          <RelatedProducts
            product={product}
            categories={categories}
            theme={theme}
            onBuyNow={onBuyNow}
            onViewDetails={(productId) => {
              if (productId !== product._id && onViewDetails) {
                onViewDetails(productId);
              }
            }}
            sellerId={sellerId}
          />
        </div>
      </motion.div>
    </>
  );
}
