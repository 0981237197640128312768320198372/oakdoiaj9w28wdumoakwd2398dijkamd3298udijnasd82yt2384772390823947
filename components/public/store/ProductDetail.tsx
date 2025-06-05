/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Share2,
  Heart,
  Info,
  MessageSquare,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { MdShoppingCartCheckout } from 'react-icons/md';
import { Product, Category, ThemeType } from '@/types';
import { cn, dokmaiCoinSymbol, dokmaiImagePlaceholder } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import RelatedProducts from './RelatedProducts';

interface ProductDetailProps {
  product: Product;
  category?: Category;
  categories?: Category[];
  theme: ThemeType;
  onBack: () => void;
  onBuyNow: (productId: string) => void;
  sellerId?: string;
}

export default function ProductDetail({
  product,
  category,
  categories = [],
  theme,
  onBack,
  onBuyNow,
  sellerId,
}: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>(
    'description'
  );
  const [isScrolled, setIsScrolled] = useState(false);

  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';
  const imagePlaceholder = dokmaiImagePlaceholder(isLight);
  const currentImage =
    product.images.length > 0 ? product.images[currentImageIndex] : imagePlaceholder;

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleBuyNow = () => {
    onBuyNow(product._id);
  };

  const handleShare = () => {
    alert('Share functionality will be implemented in the future');
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
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105',
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
        'w-16 h-16 rounded-lg border cursor-pointer transition-all duration-200 !bg-red-500',
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
          : 'bg-dark-500 text-light-400 border border-dark-400'
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

      actionButtons: cn('flex gap-3 mt-6'),
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
        'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-md',
        themeUtils.getPrimaryColorClass('bg'),
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

      stickyBuyButton: cn(
        'fixed bottom-0 left-0 right-0 p-4 z-50 transition-transform duration-300 shadow-lg md:hidden',
        isLight ? 'bg-light-100/95 backdrop-blur-md' : 'bg-dark-800/95 backdrop-blur-md',
        isScrolled ? 'translate-y-0' : 'translate-y-full'
      ),
      dokmaiCoin: dokmaiCoinSymbol(isLight),
      divider: cn('w-full h-px my-6', isLight ? 'bg-light-300' : 'bg-dark-600'),
    };
  };

  const styles = getStyles();

  const specifications = [
    { label: 'ประเภทสินค้า', value: 'สินค้าดิจิทัล' },
    { label: 'ระยะเวลาใช้งาน', value: '30 วัน' },
    { label: 'รองรับอุปกรณ์', value: 'ทุกอุปกรณ์' },
    { label: 'การจัดส่ง', value: 'ทันที (ดิจิทัล)' },
  ];

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
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />

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
                    <div className="relative w-full h-full ">
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

            <div className="flex items-center gap-3 flex-wrap">
              {product.rating ? (
                <div className={styles.ratingContainer}>
                  <div className={styles.ratingBadge}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        fill={parseFloat(product.rating) >= star ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        className="mr-0.5"
                      />
                    ))}
                    <span className="text-sm ml-1 font-medium">{product.rating}</span>
                  </div>
                  <span className={styles.ratingCount}>(รีวิว 24 รายการ)</span>
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
                    {product.price.toFixed(2)}
                  </span>
                  <span className={styles.discountedPrice}>
                    <Image
                      src={styles.dokmaiCoin}
                      alt="Dokmai Coin"
                      className="h-7 w-auto"
                      width={50}
                      height={50}
                    />
                    {discountedPrice.toFixed(2)}
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

            {/* Quick info cards */}
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

            <div className={styles.actionButtons}>
              <motion.button
                onClick={handleBuyNow}
                className={styles.buyButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                ซื้อเลย
                <MdShoppingCartCheckout className="text-xl" />
              </motion.button>

              <motion.button
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Add to favorites">
                <Heart size={20} />
              </motion.button>

              <motion.button
                onClick={handleShare}
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Share product">
                <Share2 size={20} />
              </motion.button>
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
            className={cn(styles.tab, activeTab === 'specifications' && styles.activeTab)}
            onClick={() => setActiveTab('specifications')}>
            ข้อมูลจำเพาะ
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
                    isLight ? 'bg-light-50 text-dark-700' : 'bg-dark-800/50 text-light-300'
                  )}>
                  {product.description || 'ไม่มีคำอธิบายสินค้า'}
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                key="specifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <h3 className="text-xl font-semibold mb-4">ข้อมูลจำเพาะ</h3>
                <div
                  className={cn(
                    'rounded-xl overflow-hidden border',
                    isLight ? 'border-light-300' : 'border-dark-600'
                  )}>
                  {specifications.map((spec, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex flex-col sm:flex-row sm:items-center py-3 px-4',
                        index % 2 === 0
                          ? isLight
                            ? 'bg-light-50'
                            : 'bg-dark-800/30'
                          : isLight
                          ? 'bg-light-100'
                          : 'bg-dark-800/60',
                        index !== specifications.length - 1 && 'border-b',
                        isLight ? 'border-light-200' : 'border-dark-600'
                      )}>
                      <div
                        className={cn(
                          'sm:w-1/3 font-medium',
                          isLight ? 'text-dark-600' : 'text-light-400'
                        )}>
                        {spec.label}
                      </div>
                      <div className="sm:w-2/3 mt-1 sm:mt-0">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <h3 className="text-xl font-semibold mb-4">รีวิวจากลูกค้า</h3>
                <div
                  className={cn(
                    'p-8 rounded-xl border flex flex-col items-center justify-center text-center',
                    isLight ? 'bg-light-50 border-light-300' : 'bg-dark-800/50 border-dark-600'
                  )}>
                  <MessageSquare size={40} className="opacity-40 mb-3" />
                  <p className="text-lg font-medium mb-2">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                  <p className={cn('text-sm', isLight ? 'text-dark-500' : 'text-light-500')}>
                    เป็นคนแรกที่รีวิวสินค้านี้หลังจากการซื้อ
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 md:px-6 mt-8">
          <h3 className="text-xl font-semibold  mb-4">สินค้าที่เกี่ยวข้อง</h3>
          <RelatedProducts
            product={product}
            categories={categories}
            theme={theme}
            onBuyNow={onBuyNow}
            onViewDetails={(productId) => {
              if (productId !== product._id) {
                window.location.href = `?productId=${productId}`;
              }
            }}
            sellerId={sellerId}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isScrolled && (
          <motion.div
            className={styles.stickyBuyButton}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {product.title.length > 20
                    ? `${product.title.substring(0, 20)}...`
                    : product.title}
                </span>
                <span className={cn('font-bold', themeUtils.getPrimaryColorClass('text'))}>
                  ฿{hasDiscount ? discountedPrice.toFixed(2) : product.price.toFixed(2)}
                </span>
              </div>
              <motion.button
                onClick={handleBuyNow}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2',
                  themeUtils.getPrimaryColorClass('bg'),
                  isLight ? 'text-light-100' : 'text-dark-800'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                ซื้อเลย
                <MdShoppingCartCheckout />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
