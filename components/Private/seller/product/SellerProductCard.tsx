'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Product } from '@/types';
import Image from 'next/image';
import dokmaicoin from '@/assets/icons/DCSymbolWhite.svg';

interface SellerProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onManageData: (product: Product) => void;
  categories?: { _id: string; name: string; logoUrl?: string }[];
}

const SellerProductCard: React.FC<SellerProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onManageData,
  categories = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentImage =
    product.images.length > 0
      ? product.images[currentImageIndex]
      : '/images/dokmai-placeholder.webp';

  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  // Find the category for this product
  const category = categories.find((cat) => cat._id === product.categoryId);

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

  return (
    <div
      className="group relative bg-gradient-to-b from-dark-800 to-dark-850 rounded-lg overflow-hidden border border-dark-600 hover:border-dark-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-dark-800/20 hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
      <div className="relative aspect-square w-full overflow-hidden bg-dark-700/50">
        <Image
          src={currentImage}
          alt={product.title}
          fill
          className="object-contain p-2 group-hover:scale-102 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 via-transparent to-transparent group-hover:opacity-0 opacity-100 transition-opacity duration-300" />

        {/* Image navigation controls - only show when hovering and multiple images */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={goToPrevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-dark-800/80 text-light-200 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/80 hover:text-dark-800">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-dark-800/80 text-light-200 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary/80 hover:text-dark-800">
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image pagination dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-primary scale-125'
                    : 'bg-light-500/50 hover:bg-light-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}

        {/* Status badge */}
        <div
          className={`
            absolute bottom-1 right-1 flex items-center gap-1 px-1 py-0.5 rounded-lg text-xs font-medium
            backdrop-blur-md transition-all duration-200
            ${
              product.status === 'active'
                ? 'bg-green-900 border border-green-500/20 text-green-500'
                : 'bg-amber-900 border border-amber-500/20 text-amber-500'
            }
          `}>
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

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-1 right-1 bg-primary text-dark-800 px-1.5 py-0.5 rounded text-xs font-bold">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex flex-col items-start justify-start gap-2">
          <h3 className="text-sm font-medium text-light-200 line-clamp-1">{product.title}</h3>

          {/* Price display with discount */}
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-xs line-through text-light-500 whitespace-nowrap flex gap-1 items-center">
                    <Image
                      src={dokmaicoin}
                      alt="Dokmai Coin"
                      className="h-3 w-3"
                      width={50}
                      height={50}
                    />
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-primary whitespace-nowrap flex gap-1 items-center">
                    <Image
                      src={dokmaicoin}
                      alt="Dokmai Coin"
                      className="h-4 w-4"
                      width={50}
                      height={50}
                    />
                    {discountedPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-primary whitespace-nowrap flex gap-1 items-center">
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
            {category && (
              <div>
                {category.logoUrl ? (
                  <>
                    <Image
                      src={category.logoUrl}
                      alt={category.name}
                      width={50}
                      height={50}
                      className="w-auto h-3"
                    />
                  </>
                ) : (
                  <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center">
                    <span className="text-[8px] text-primary">CAT</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-dark-600">
          <span className="text-xs text-light-600">Stock: {product._stock}</span>
          <div className="flex -space-x-1">
            <button
              onClick={() => onManageData(product)}
              className="relative p-1.5 text-light-500 hover:text-blue-400 rounded-full hover:bg-blue-500/10 transition-all duration-200 z-20">
              <Database size={14} />
            </button>
            <button
              onClick={() => onEdit(product)}
              className="relative p-1.5 text-light-500 hover:text-primary rounded-full hover:bg-primary/10 transition-all duration-200 z-10">
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="relative p-1.5 text-light-500 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-all duration-200">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductCard;
