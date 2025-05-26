/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import SellerCategories from './SellerCategories';
import { Category, Product } from '@/types';
import BannerAdsCarousel from './BannerAdsCarousel';
interface HomeStorePageProps {
  products: Product[];
  categories: Category[];
  theme: any;
}

const HomeStorePage: React.FC<HomeStorePageProps> = ({ products, categories, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-8 max-w-screen-lg">
      <BannerAdsCarousel theme={theme} />
      <section className="bg-dark-750 border border-dark-600 rounded-xl p-6 shadow-lg mt-8">
        <SellerCategories products={products} categories={categories} />
      </section>
    </motion.div>
  );
};

export default HomeStorePage;
