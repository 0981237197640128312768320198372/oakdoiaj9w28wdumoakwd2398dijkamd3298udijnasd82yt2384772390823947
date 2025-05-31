'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Tag, ShoppingCart } from 'lucide-react';
import { Product, ThemeType, Category } from '@/types';
import Image from 'next/image';
import dokmaicoin from '@/assets/images/dokmaicoin3d.png';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface ProductCardProps {
  product: Product;
  theme: ThemeType;
  onBuyNow?: (productId: string) => void;
  category?: Category;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, theme, onBuyNow, category }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const themeUtils = useThemeUtils(theme || null);

  const currentImage =
    product.images.length > 0
      ? product.images[currentImageIndex]
      : '/images/dokmai-placeholder.webp';

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  useEffect(() => {
    if (product.images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      if (!isHovering) {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [product.images.length, isHovering]);

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product._id);
    }
  };

  const getCardStyles = () => {
    const isLight = themeUtils?.baseTheme === 'light';
    return {
      card: cn(
        'group relative overflow-hidden rounded-lg border transition-all duration-300 shadow-sm hover:shadow-lg ',
        isLight
          ? 'bg-light-50 border-light-300 hover:border-light-400 hover:shadow-light-300/20'
          : 'bg-dark-600 border-dark-400 hover:border-dark-400 hover:shadow-dark-800/20'
      ),
      imageContainer: cn(
        'relative aspect-square w-full overflow-hidden',
        isLight ? 'bg-light-100/50' : 'bg-dark-700/50'
      ),
      navButton: cn(
        'absolute top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        isLight
          ? 'bg-light-200/90 text-dark-800 hover:bg-light-300'
          : 'bg-dark-700/90 text-light-200 hover:bg-dark-800'
      ),
      indicator: cn(
        'w-1.5 h-1.5 rounded-full transition-all duration-300',
        themeUtils?.getPrimaryColorClass('bg')
      ),
      inactiveIndicator: cn(
        'w-1.5 h-1.5 rounded-full transition-all duration-300',
        isLight ? 'bg-dark-500/30 hover:bg-dark-500/50' : 'bg-light-500/50 hover:bg-light-500'
      ),
      discountBadge: cn(
        'absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-bold',
        themeUtils?.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      statusBadge: cn(
        'absolute top-1 left-1 px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm border',
        isLight ? 'bg-light-100/80 border-light-300' : 'bg-dark-800/80 border-dark-600'
      ),
      contentContainer: cn('p-3 space-y-2', isLight ? 'text-dark-800' : 'text-light-200'),
      title: cn(
        'text-base font-semibold line-clamp-1',
        isLight ? 'text-dark-800' : 'text-light-200'
      ),
      originalPrice: cn(
        'text-[12px] line-through whitespace-nowrap flex gap-1 items-center opacity-60',
        isLight ? 'text-dark-500' : 'text-light-500'
      ),
      discountedPrice: cn(
        'text-sm font-semibold whitespace-nowrap flex gap-1 items-center ',
        themeUtils?.getPrimaryColorClass('text')
      ),
      regularPrice: cn(
        'text-xs font-semibold whitespace-nowrap flex gap-1 items-center',
        themeUtils?.getPrimaryColorClass('text')
      ),
      footer: cn(
        'flex items-center justify-between pt-2 border-t',
        isLight ? 'border-light-300' : 'border-dark-600'
      ),
      stockText: cn('text-xs', isLight ? 'text-dark-600' : 'text-light-600'),
      buyButton: cn(
        'px-2 py-1 rounded text-xs font-medium flex items-center gap-1',
        themeUtils?.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      createdDate: cn(
        'text-xs flex items-center gap-1',
        isLight ? 'text-dark-500' : 'text-light-600'
      ),
      ratingContainer: cn('flex items-center gap-1', isLight ? 'text-amber-500' : 'text-amber-400'),
      categoryTag: cn(
        'flex items-center gap-1 text-xs ',
        isLight ? 'text-dark-600' : 'text-light-500'
      ),
    };
  };

  const styles = getCardStyles();

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      <div className={styles.imageContainer}>
        <Image
          src={currentImage}
          alt={product.title}
          fill
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {product.images.length > 1 && (
          <>
            <button onClick={goToPrevImage} className={cn(styles.navButton, 'left-1')}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToNextImage} className={cn(styles.navButton, 'right-1')}>
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {product.images.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={
                  index === currentImageIndex
                    ? cn(styles.indicator, 'scale-125')
                    : styles.inactiveIndicator
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {hasDiscount && (
          <div className={styles.discountBadge}>{product.discountPercentage}% OFF</div>
        )}
      </div>

      <div className={styles.contentContainer}>
        <div className="flex flex-col items-start justify-start gap-1">
          {product.rating ? (
            <div className={styles.ratingContainer}>
              <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={parseFloat(product.rating) >= star ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="mr-0.5"
                  />
                ))}
                <span className="text-xs ml-1 font-medium">{product.rating}</span>
              </div>
            </div>
          ) : (
            ''
          )}
          <div className="flex items-center gap-1 text-xs w-full justify-between">
            <h3 className={styles.title}>{product.title}</h3>
            <div className={cn(styles.categoryTag, 'px-2 py-1 flex items-center')}>
              {category?.logoUrl ? (
                <Image
                  src={category.logoUrl}
                  alt={category.name}
                  width={25}
                  height={25}
                  className="mr-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.classList.remove('hidden');
                    }
                  }}
                />
              ) : (
                <span>{category?.name}</span>
              )}
              <Tag size={10} />
            </div>
          </div>
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className={styles.discountedPrice}>
                    <Image
                      src={dokmaicoin}
                      alt="Dokmai Coin"
                      className="h-4 w-4"
                      width={50}
                      height={50}
                    />
                    {discountedPrice.toFixed(2)}
                  </span>
                  <span className={styles.originalPrice}>
                    <Image
                      src={dokmaicoin}
                      alt="Dokmai Coin"
                      className="h-3 w-3"
                      width={50}
                      height={50}
                    />
                    {product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className={styles.regularPrice}>
                  <Image
                    src={dokmaicoin}
                    alt="Dokmai Coin"
                    className="h-4 w-4"
                    width={50}
                    height={50}
                  />
                  {product.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.stockText}>Available: {product.stock}</span>
          <button
            onClick={handleBuyNow}
            className={cn(styles.buyButton, 'transition-all duration-200 hover:scale-105')}>
            <ShoppingCart size={12} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
