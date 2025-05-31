/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import SellerCategories from './SellerCategories';
import { Category, Product } from '@/types';
import BannerAdsCarousel from './BannerAdsCarousel';
import DiscountedProducts from './DiscountedProducts';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
interface HomeStorePageProps {
  products: Product[];
  categories: Category[];
  theme: any;
  onNavigate: (page: string) => void;
}

const HomeStorePage: React.FC<HomeStorePageProps> = ({
  products,
  categories,
  theme,
  onNavigate,
}) => {
  const themeUtils = useThemeUtils(theme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 max-w-screen-lg">
      <BannerAdsCarousel theme={theme} />
      <DiscountedProducts products={products} theme={theme} onNavigate={onNavigate} />
      <section
        className={cn(
          'rounded-xl p-5 mt-8',
          themeUtils.getCardClass(),
          themeUtils.getTextColors()
        )}>
        <SellerCategories theme={theme} products={products} categories={categories} />
      </section>
    </motion.div>
  );
};

export default HomeStorePage;
