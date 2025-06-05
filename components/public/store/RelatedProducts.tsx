'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Product, Category, ThemeType } from '@/types';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import ProductCard from '@/components/shared/ProductCard';
import useRelatedProducts from '@/hooks/useRelatedProducts';

interface RelatedProductsProps {
  product: Product;
  categories: Category[];
  theme: ThemeType;
  onBuyNow: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  sellerId?: string;
}

export default function RelatedProducts({
  product,
  categories,
  theme,
  onBuyNow,
  onViewDetails,
  sellerId,
}: RelatedProductsProps) {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  const { relatedProducts, isLoading, error } = useRelatedProducts(
    product._id,
    product.categoryId,
    sellerId
  );
  console.log('RelatedProducts props:', {
    productId: product._id,
    categoryId: product.categoryId,
    sellerId,
  });
  console.log('Related products data:', relatedProducts);
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'p-8 rounded-xl border flex flex-col items-center justify-center text-center',
          isLight ? 'bg-light-50 border-light-300' : 'bg-dark-800/50 border-dark-600'
        )}>
        <div className="animate-pulse flex flex-col items-center">
          <div
            className={cn('h-6 w-24 rounded mb-4', isLight ? 'bg-light-300' : 'bg-dark-600')}></div>
          <div className={cn('h-4 w-48 rounded', isLight ? 'bg-light-200' : 'bg-dark-700')}></div>
        </div>
      </div>
    );
  }

  if (error || relatedProducts.length === 0) {
    return (
      <div
        className={cn(
          'p-8 rounded-xl border flex flex-col items-center justify-center text-center',
          isLight ? 'bg-light-50 border-light-300' : 'bg-dark-800/50 border-dark-600'
        )}>
        <p className={cn('text-sm', isLight ? 'text-dark-500' : 'text-light-500')}>
          {error || 'ไม่พบสินค้าที่เกี่ยวข้อง'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {relatedProducts.map((relatedProduct) => {
        const category = categories.find((cat) => cat._id === relatedProduct.categoryId);
        return (
          <motion.div key={relatedProduct._id} variants={itemVariants}>
            <ProductCard
              product={relatedProduct}
              theme={theme}
              role="buyer"
              category={category}
              onBuyNow={onBuyNow}
              onViewDetails={onViewDetails}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
