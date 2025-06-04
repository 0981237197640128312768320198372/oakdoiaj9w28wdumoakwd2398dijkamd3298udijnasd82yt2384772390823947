/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Star, ChevronLeft, ChevronRight, Package, Clock } from 'lucide-react';
import { MdShoppingCartCheckout } from 'react-icons/md';
import { Product, Category, ThemeType } from '@/types';
import { cn, dokmaiCoinSymbol, dokmaiImagePlaceholder } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface ProductDetailProps {
  product: Product;
  category?: Category;
  theme: ThemeType;
  onBack: () => void;
  onBuyNow: (productId: string) => void;
}

export default function ProductDetail({
  product,
  category,
  theme,
  onBack,
  onBuyNow,
}: ProductDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleBuyNow = () => {
    onBuyNow(product._id);
  };

  const getStyles = () => {
    return {
      container: cn(
        'w-full animate-fade-in space-y-6',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass()
      ),
      header: cn(
        'flex items-center justify-between mb-6',
        isLight ? 'text-dark-800' : 'text-light-200'
      ),
      backButton: cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        isLight ? 'hover:bg-light-200 text-dark-700' : 'hover:bg-dark-700 text-light-300'
      ),
      title: cn('text-xl md:text-2xl font-bold', isLight ? 'text-dark-800' : 'text-light-100'),
      mainContent: cn('grid grid-cols-1 md:grid-cols-2 gap-8'),
      imageSection: cn(
        'relative aspect-square w-full overflow-hidden rounded-lg border',
        isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-500'
      ),
      thumbnailContainer: cn('flex gap-2 mt-4 overflow-x-auto pb-2'),
      thumbnail: cn(
        'w-16 h-16 rounded-md border cursor-pointer transition-all',
        isLight ? 'border-light-300 hover:border-primary' : 'border-dark-500 hover:border-primary'
      ),
      activeThumbnail: cn(
        'border-2 scale-105 shadow-md',
        themeUtils.getPrimaryColorClass('border')
      ),
      infoSection: cn('space-y-6', isLight ? 'text-dark-800' : 'text-light-200'),
      categoryTag: cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
        isLight
          ? 'bg-light-200 text-dark-600 border border-light-300'
          : 'bg-dark-600 text-light-400 border border-dark-500'
      ),
      ratingContainer: cn(
        'flex items-center gap-1 mt-2',
        isLight ? 'text-amber-500' : 'text-amber-400'
      ),
      priceContainer: cn('flex flex-col gap-1 mt-4'),
      originalPrice: cn(
        'text-sm line-through whitespace-nowrap font-thin flex gap-2 items-center opacity-60',
        isLight ? 'text-red-500' : 'text-light-500'
      ),
      discountedPrice: cn(
        'text-2xl font-bold whitespace-nowrap flex gap-2 items-center',
        isLight ? 'text-dark-800' : themeUtils.getPrimaryColorClass('text')
      ),
      regularPrice: cn(
        'text-2xl font-bold whitespace-nowrap flex gap-2 items-center',
        isLight ? 'text-dark-800' : themeUtils.getPrimaryColorClass('text')
      ),
      descriptionTitle: cn(
        'text-lg font-semibold mt-6 mb-2',
        isLight ? 'text-dark-800' : 'text-light-200'
      ),
      description: cn(
        'text-sm leading-relaxed whitespace-pre-line',
        isLight ? 'text-dark-600' : 'text-light-400'
      ),
      infoItem: cn('flex items-center gap-2 text-sm', isLight ? 'text-dark-600' : 'text-light-400'),
      buyButton: cn(
        'mt-6 px-6 py-3 rounded-lg text-base font-medium flex items-center justify-center gap-2 transition-all hover:scale-105',
        themeUtils.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      navButton: cn(
        'absolute top-1/2 -translate-y-1/2 p-2 rounded-full z-10',
        isLight
          ? 'bg-light-200/90 text-dark-800 hover:bg-light-300'
          : 'bg-dark-700/90 text-light-200 hover:bg-dark-800'
      ),
      discountBadge: cn(
        'absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold',
        themeUtils.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      dokmaiCoin: dokmaiCoinSymbol(isLight),
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}>
      {/* Header with back button */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={18} />
          <span>กลับไปยังสินค้าทั้งหมด</span>
        </button>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Image section */}
        <div>
          <div className={styles.imageSection}>
            <Image
              src={currentImage}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {product.images.length > 1 && (
              <>
                <button onClick={goToPrevImage} className={cn(styles.navButton, 'left-2')}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={goToNextImage} className={cn(styles.navButton, 'right-2')}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {hasDiscount && (
              <div className={styles.discountBadge}>ลด {product.discountPercentage}%</div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className={styles.thumbnailContainer}>
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    styles.thumbnail,
                    index === currentImageIndex && styles.activeThumbnail
                  )}
                  onClick={() => setCurrentImageIndex(index)}>
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${product.title} - ภาพที่ ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info section */}
        <div className={styles.infoSection}>
          {category && (
            <div className={styles.categoryTag}>
              {category.logoUrl ? (
                <Image
                  src={category.logoUrl}
                  alt={category.name}
                  width={16}
                  height={16}
                  className="mr-1"
                />
              ) : null}
              <span>{category.name}</span>
            </div>
          )}

          <h1 className={styles.title}>{product.title}</h1>

          {product.rating && (
            <div className={styles.ratingContainer}>
              <div className="flex items-center bg-amber-500/10 px-3 py-1 rounded-lg">
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
            </div>
          )}

          {/* Price section */}
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
                    className="h-6 w-auto"
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
                  className="h-6 w-auto"
                  width={50}
                  height={50}
                />
                {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Product info items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className={styles.infoItem}>
              <Package size={16} />
              <span>พร้อมส่ง: {product._stock} ชิ้น</span>
            </div>

            <div className={styles.infoItem}>
              <Clock size={16} />
              <span>วันที่เพิ่ม: {new Date(product.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className={styles.descriptionTitle}>รายละเอียดสินค้า</h3>
            <p className={styles.description}>{product.description}</p>
          </div>

          {/* Buy button */}
          <button onClick={handleBuyNow} className={styles.buyButton}>
            ซื้อเลย
            <MdShoppingCartCheckout className="text-xl" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
