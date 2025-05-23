'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Product, Category } from '@/types';
import Image from 'next/image';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag } from 'lucide-react';

interface SellerCategoriesProps {
  products: Product[];
  categories: Category[];
}

const SellerCategories: React.FC<SellerCategoriesProps> = ({ products, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Toggle category selection
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory((prevCategory) => (prevCategory === categoryId ? null : categoryId));
  };

  // Update filtered products when category changes
  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(products.filter((product) => product.categoryId === selectedCategory));
    } else {
      setFilteredProducts([]); // Show no products when no category is selected
    }
  }, [selectedCategory, products]);
  return (
    <div className="w-full space-y-6">
      {/* Category Filter Section */}
      <div className="flex flex-wrap gap-3 mb-5">
        {categories.map((category) => (
          <motion.button
            key={category._id}
            onClick={() => handleCategoryClick(category._id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-3 rounded-full transition-all duration-300
              border border-dark-500 backdrop-blur-sm
              ${
                selectedCategory === category._id
                  ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10'
                  : 'bg-dark-700/80 hover:bg-dark-600'
              }
              aspect-square flex items-center justify-center min-w-[50px] min-h-[50px]
            `}
            aria-label={category.name}>
            {category.logoUrl ? (
              <Image
                src={(category.logoUrl as unknown as string) || '/placeholder.svg'}
                alt={category.name}
                width={30}
                height={30}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <Tag className="w-5 h-5 text-light-200" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Products Grid - Only show when a category is selected */}
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
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <div className="bg-dark-700/50 rounded-xl p-8 border border-dark-600">
                  <p className="text-light-300">No products found in this category</p>
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
