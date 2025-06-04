/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Product, Category } from '@/types';
import Image from 'next/image';
import ProductCard from '../../shared/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface SellerCategoriesProps {
  products: Product[];
  categories: Category[];
  theme: any;
}

const SellerCategories: React.FC<SellerCategoriesProps> = ({ products, categories, theme }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const themeUtils = useThemeUtils(theme);

  const getCategoryStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      background: isLight
        ? 'bg-light-200/80 hover:bg-light-300'
        : 'bg-dark-700/80 hover:bg-dark-600',
      border: isLight ? 'border-light-300' : 'border-dark-500',
      text: isLight ? 'text-dark-800' : 'text-light-200',
      noResults: isLight ? 'bg-light-100/50 border-light-200' : 'bg-dark-700/50 border-dark-600',
      noResultsText: isLight ? 'text-dark-600' : 'text-light-300',
    };
  };

  const categoryStyles = getCategoryStyles();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory((prevCategory) => (prevCategory === categoryId ? null : categoryId));
  };

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter((product) => product.categoryId === selectedCategory));
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, products]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap gap-3 mb-5">
        {categories.map((category) => (
          <motion.button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-3 border backdrop-blur-sm font-aktivGroteskRegular flex items-center justify-center min-h-[50px]',
              themeUtils.getComponentRoundednessClass(),
              selectedCategory === category._id
                ? cn(
                    themeUtils.getPrimaryColorClass('bg') + '/10',
                    themeUtils.getPrimaryColorClass('border') + '/40',
                    themeUtils.getButtonShadowClass(),
                    `shadow-${themeUtils.primaryColor}/10`
                  )
                : cn(categoryStyles.background, categoryStyles.border)
            )}
            aria-label={category.name}>
            {category.logoUrl ? (
              <Image
                src={(category.logoUrl as unknown as string) || '/placeholder.svg'}
                alt={category.name}
                width={30}
                height={30}
                className="w-auto h-6 object-contain"
              />
            ) : (
              <Tag className={cn('w-auto h-5', categoryStyles.text)} />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}>
                  <ProductCard theme={theme} product={product} role="seller" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <div
                  className={cn(
                    'p-8 border',
                    categoryStyles.noResults,
                    themeUtils.getComponentRoundednessClass()
                  )}>
                  <p className={categoryStyles.noResultsText}>No products found in this category</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerCategories;
