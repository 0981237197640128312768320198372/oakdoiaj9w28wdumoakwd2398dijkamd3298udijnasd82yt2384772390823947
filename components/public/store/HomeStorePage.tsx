/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import ProductsCategory from './ProductsCategory';
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
  console.log(
    '%c🖕🏻🖕🏼🖕🏽🖕🏾🖕🏿',
    'display: inline-block; width: 64px; height: 64px; text-align: center; line-height: 64px; font-size: 32px; color: white; background: black; padding: 10px; font-weight: bold; border-radius: 10px;'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-10 max-w-screen-lg">
      <BannerAdsCarousel theme={theme} />
      <DiscountedProducts products={products} theme={theme} onNavigate={onNavigate} />
      <ProductsCategory
        categories={categories}
        products={products}
        theme={theme}
        onNavigate={onNavigate}
      />
    </motion.div>
  );
};

export default HomeStorePage;
