'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Edit, Trash2, AlertTriangle, Check } from 'lucide-react';
import QuantityControls from '@/components/public/store/QuantityControls';
import { Product, ThemeType, Category } from '@/types';
import Image from 'next/image';
import { cn, dokmaiCoinSymbol, dokmaiImagePlaceholder, formatPrice } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useProductReviews } from '@/hooks/useReviews';

interface ProductCardProps {
  product: Product;
  theme: ThemeType;
  role: 'seller' | 'buyer';
  // onBuyNow prop kept for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBuyNow?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  category?: Category;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  theme,
  role,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  onBuyNow,
  onViewDetails,
  onEdit,
  onDelete,
  category,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldLoadReviews, setShouldLoadReviews] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const themeUtils = useThemeUtils(theme || null);

  // Only load reviews when needed (lazy loading)
  const { stats: reviewStats, isLoading: reviewsLoading } = useProductReviews(
    shouldLoadReviews ? product._id : null
  );

  // Intersection Observer for lazy loading reviews
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadReviews) {
            setShouldLoadReviews(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [shouldLoadReviews]);

  const isLight = themeUtils.baseTheme === 'light';
  const isSeller = role === 'seller';

  const imagePlaceholder = dokmaiImagePlaceholder(isLight);
  const currentImage =
    product.images.length > 0 ? product.images[currentImageIndex] : imagePlaceholder;

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

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product._id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (onDelete) {
      onDelete(product._id);
    }
  };

  const getCardStyles = () => {
    return {
      card: cn(
        'group relative overflow-hidden rounded-lg border transition-all duration-300 shadow-sm hover:shadow-lg cursor-pointer',
        isLight
          ? 'bg-light-100 border-light-300 hover:border-light-400 hover:shadow-light-300/20'
          : 'bg-dark-600 border-dark-400 hover:border-dark-400 hover:shadow-dark-800/20'
      ),
      imageContainer: cn(
        'relative aspect-square w-full overflow-hidden',
        themeUtils.getComponentRoundednessClass(),
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
        themeUtils.getPrimaryColorClass('bg')
      ),
      inactiveIndicator: cn(
        'w-1.5 h-1.5 rounded-full transition-all duration-300',
        isLight ? 'bg-dark-500/30 hover:bg-dark-500/50' : 'bg-light-500/50 hover:bg-light-500'
      ),
      discountBadge: cn(
        'absolute top-3 right-1 px-1 py-0.5 rounded text-sm lg:text-lg font-black animate-bounce pointer-events-none',
        themeUtils.getButtonClass()
      ),
      statusBadge: cn(
        'absolute top-1 left-1 px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm border',
        isLight ? 'bg-light-100/80 border-light-300' : 'bg-dark-800/80 border-dark-600'
      ),
      contentContainer: cn('p-3 space-y-2', isLight ? 'text-dark-800' : 'text-light-200'),
      title: cn(
        'text-xs lg:text-sm font-semibold line-clamp-1 w-full',
        isLight ? 'text-dark-800' : 'text-light-200'
      ),
      originalPrice: cn(
        'text-[12px] line-through whitespace-nowrap font-thin flex gap-2 items-center opacity-60',
        isLight ? 'text-red-500' : 'text-light-500'
      ),
      discountedPrice: cn(
        'text-md font-semibold whitespace-nowrap flex gap-2 items-center ',
        isLight ? 'text-dark-800' : themeUtils?.getPrimaryColorClass('text')
      ),
      regularPrice: cn(
        'text-md font-semibold whitespace-nowrap flex gap-2 items-center',
        isLight ? 'text-dark-800' : themeUtils?.getPrimaryColorClass('text')
      ),
      footer: cn(
        'flex flex-col items-center pt-3 border-t',
        isLight ? 'border-light-300' : 'border-dark-300'
      ),
      stockText: cn('text-xs', isLight ? 'text-dark-600' : 'text-light-600'),
      buyButton: cn(
        'md:px-2 md:py-1 px-2 pt-1 rounded text-xs lg:text-lg font-medium flex items-center gap-1 hover:scale-105',
        themeUtils?.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),
      actionButton: cn(
        'relative p-1.5 w-full flex items-center justify-center rounded transition-all duration-200 z-10'
      ),
      editButton: cn('text-primary bg-primary/10 hover:bg-primary/20 py-1 px-2'),
      deleteButton: cn('text-red-500 bg-red-500/10 hover:bg-red-500/20 py-1 px-2'),
      createdDate: cn(
        'text-xs flex items-center gap-1',
        isLight ? 'text-dark-500' : 'text-light-600'
      ),
      ratingContainer: cn('flex items-center gap-1', isLight ? 'text-amber-500' : 'text-amber-400'),
      dokmaiCoin: dokmaiCoinSymbol(isLight),
      categoryTag: cn(
        'flex items-center justify-center gap-1 px-2 py-1 rounded text-xs absolute top-1 left-1 border-[1px]',
        isLight
          ? 'text-dark-600 bg-light-200 border-light-400'
          : 'text-light-500 bg-dark-500 border-dark-400'
      ),
      statusIndicator: cn(
        'absolute bottom-1 right-1 flex items-center gap-1 px-1 py-0.5 rounded-lg text-xs font-medium backdrop-blur-md transition-all duration-200',
        product.status === 'active'
          ? isLight
            ? 'bg-green-100 border border-green-500/20 text-green-700'
            : 'bg-green-900 border border-green-500/20 text-green-500'
          : isLight
          ? 'bg-amber-100 border border-amber-500/20 text-amber-700'
          : 'bg-amber-900 border border-amber-500/20 text-amber-500'
      ),
    };
  };
  const styles = getCardStyles();

  return (
    <div
      ref={cardRef}
      className={cn(styles.card, 'h-full flex flex-col')}
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      <div className={styles.imageContainer}>
        <Image
          src={currentImage}
          alt={product.title}
          fill
          className={cn(
            'object-contain group-hover:scale-105 transition-transform duration-500 w-full h-full',
            themeUtils.getComponentRoundednessClass(),
            product._stock === 0 ? 'grayscale' : ''
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Sold out overlay */}
        {product._stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center backdop-blur-sm bg-black/5">
            <div className="bg-red-500/20 text-red-500 border-red-500/30 border-[1px] px-4 py-2 rounded-lg font-bold text-lg shadow-lg rotate-12">
              SOLD
            </div>
          </div>
        )}

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
          <div className={styles.discountBadge}>
            {isSeller ? `ลด ${product.discountPercentage}%` : `ลด ${product.discountPercentage}%`}
          </div>
        )}

        {/* Status indicator for seller view */}
        {isSeller && (
          <div className={styles.statusIndicator}>
            {product.status === 'active' ? (
              <>
                <Check size={10} strokeWidth={2.5} />
                <span>Active</span>
              </>
            ) : (
              <>
                <AlertTriangle size={10} strokeWidth={2.5} />
                <span>Draft</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className={cn(styles.contentContainer, 'flex-grow flex flex-col justify-between ')}>
        <div className="flex flex-col items-start justify-end gap-1">
          {reviewsLoading ? (
            <div className="flex items-center bg-gray-200 animate-pulse px-2 py-1 rounded">
              <div className="w-16 h-3 bg-gray-300 rounded"></div>
            </div>
          ) : reviewStats && reviewStats.averageRating > 0 ? (
            <div className={styles.ratingContainer}>
              <div className="flex items-center justify-center bg-amber-500/10 border-[1px] border-amber-500 px-2 py-1 rounded">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    fill={reviewStats.averageRating >= star ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="mr-0.5"
                  />
                ))}
                <span className="text-xs ml-1 font-medium">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
                <span className="text-xs ml-1 opacity-70">({reviewStats.totalReviews})</span>
              </div>
            </div>
          ) : null}
          <div className="flex items-center gap-1 text-xs w-full justify-between">
            <h3 className={styles.title}>{product.title}</h3>
            <div className={cn(styles.categoryTag)}>
              {category?.logoUrl ? (
                <Image
                  src={category.logoUrl}
                  alt={category.name}
                  width={25}
                  height={25}
                  className="w-full"
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
            </div>
          </div>
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <div className="flex flex-col lg:flex-row-reverse lg:gap-2 gap-1">
                  <span className={styles.originalPrice}>
                    <Image
                      src={styles.dokmaiCoin}
                      alt="Dokmai Coin"
                      className="h-3 w-auto"
                      width={21}
                      height={21}
                    />
                    {product.price.toFixed(2)}
                  </span>
                  <span className={styles.discountedPrice}>
                    <Image
                      src={styles.dokmaiCoin}
                      alt="Dokmai Coin"
                      className="h-4 w-auto"
                      width={21}
                      height={21}
                    />
                    {formatPrice(discountedPrice)}
                  </span>
                </div>
              ) : (
                <span className={styles.regularPrice}>
                  <Image
                    src={styles.dokmaiCoin}
                    alt="Dokmai Coin"
                    className="h-4 w-auto"
                    width={21}
                    height={21}
                  />
                  {product.price.toFixed(2)}
                </span>
              )}
            </div>
            <span className={styles.stockText}>
              {isSeller ? `Stock: ${product._stock}` : `พร้อมส่ง: ${product._stock}`}
            </span>
          </div>
        </div>

        <div className={cn(styles.footer)}>
          {isSeller ? (
            <div className="flex gap-2 w-full justify-between">
              <button
                onClick={handleDelete}
                className={cn(styles.actionButton, styles.deleteButton)}>
                <Trash2 size={14} />
              </button>
              <button onClick={handleEdit} className={cn(styles.actionButton, styles.editButton)}>
                <Edit size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center w-full">
              <QuantityControls
                productId={product._id}
                productName={product.title}
                duration={category?.name || 'Standard'}
                price={discountedPrice}
                theme={theme}
                imageUrl={product.images[0]}
                stock={product._stock || 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
