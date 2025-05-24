'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Clock } from 'lucide-react';
import SellerCategories from './SellerCategories';
import { Category, Product } from '@/types';
import HeroSection from './HeroSection';
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
      className="w-full space-y-8">
      <HeroSection theme={theme} />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <FeaturedCard
          icon={<ShoppingBag className="w-8 h-8 text-primary" />}
          title="Latest Products"
          description="Check out our newest additions to the store"
        />
        <FeaturedCard
          icon={<Star className="w-8 h-8 text-primary" />}
          title="Featured Items"
          description="Our most popular and highly rated products"
        />
        <FeaturedCard
          icon={<Clock className="w-8 h-8 text-primary" />}
          title="Limited Offers"
          description="Special deals available for a limited time"
        />
      </section>

      <section className="bg-dark-750 border border-dark-600 rounded-xl p-6 shadow-lg mt-8">
        <SellerCategories products={products} categories={categories} />
      </section>
    </motion.div>
  );
};

const FeaturedCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 hover:border-dark-400 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-light-100 mb-2">{title}</h3>
      <p className="text-light-400 text-sm">{description}</p>
    </div>
  );
};

export default HomeStorePage;
