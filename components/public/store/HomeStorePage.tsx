/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import ProductBasedOnCategory from './ProductBasedOnCategory';
import { Category, Product } from '@/types';
import BannerAdsCarousel from './BannerAdsCarousel';
import DiscountedProducts from './DiscountedProducts';
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 max-w-screen-lg">
      <BannerAdsCarousel theme={theme} />
      <DiscountedProducts products={products} theme={theme} onNavigate={onNavigate} />
      <ProductBasedOnCategory categories={categories} products={products} theme={theme} />
    </motion.div>
  );
};

export default HomeStorePage;
