// src/components/seller/SellerCategories.tsx
'use client';

import React, { useState } from 'react';
import { Product, Category } from '@/types';
import ProductCard from './public/ProductCard';
import { motion } from 'framer-motion';

interface SellerCategoriesProps {
  products: Product[];
  categories: Category[];
}

const SellerCategories: React.FC<SellerCategoriesProps> = ({ products, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-5">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${
                selectedCategory === category._id
                  ? 'bg-primary text-dark-800'
                  : 'bg-dark-600 text-light-200 hover:bg-dark-500'
              }`}>
            {category.name}
          </button>
        ))}
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 bg-red-500 text-light-200 hover:bg-red-500/80">
            Clear Filter
          </button>
        )}
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="text-light-400 text-center">No products found in this category.</p>
        )}
      </motion.div>
    </div>
  );
};

export default SellerCategories;
