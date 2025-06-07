/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const handleViewProductDetail = (productId: string) => {
    onNavigate('products');

    localStorage.setItem('selectedProductId', productId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-10 max-w-screen-lg min-h-[75vh]">
      <BannerAdsCarousel theme={theme} />
      <DiscountedProducts
        onViewDetails={handleViewProductDetail}
        products={products}
        theme={theme}
        onNavigate={onNavigate}
      />
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
