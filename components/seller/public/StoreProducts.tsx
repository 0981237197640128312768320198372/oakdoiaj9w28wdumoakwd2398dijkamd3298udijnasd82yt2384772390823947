/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { ShoppingCart, X, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';

interface StoreProductsProps {
  store: string | undefined;
}

export default function StoreProducts({ store }: StoreProductsProps) {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>(
    'default'
  );

  // Fetch products and categories on component mount or when store changes
  useEffect(() => {
    if (!store) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch products
        const productsResponse = await fetch(`/api/v3/products?store=${store}`);
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [store]);

  // Filter and sort products using useMemo for performance
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((product) => product.categoryId === selectedCategory);
    }

    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Keep default order
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortOption('default');
  };

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
      <div className="w-full py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-dark-700 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-dark-700 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-dark-750 rounded-xl overflow-hidden border border-dark-600 animate-pulse shadow-lg">
              <div className="h-48 bg-dark-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-dark-700 rounded w-3/4"></div>
                <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                <div className="h-6 bg-dark-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full py-10 flex justify-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-5 rounded-lg max-w-md shadow-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span className="bg-red-500/20 p-1 rounded">
              <X size={18} />
            </span>
            Error Loading Products
          </h3>
          <p className="text-sm opacity-90 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 transition-colors px-4 py-2 rounded-md">
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Products grid or empty state */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center py-16 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 border border-dark-600">
              <ShoppingCart className="h-8 w-8 text-light-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-light-200">No products found</h3>
            <p className="text-light-400 max-w-md mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filter criteria'
                : "This store doesn't have any products yet"}
            </p>
            {(searchTerm || selectedCategory || sortOption !== 'default') && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm transition-colors">
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            {filteredProducts.map((product) => (
              <motion.div key={product._id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
