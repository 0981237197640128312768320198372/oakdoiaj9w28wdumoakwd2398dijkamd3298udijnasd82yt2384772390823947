/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { ShoppingCart, X, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface StoreProductsProps {
  store: string | undefined;
  theme?: any;
}

export default function StoreProducts({ store, theme }: StoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>(
    'default'
  );

  // Use the centralized theme utility
  const themeUtils = useThemeUtils(theme);

  const getComponentStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      // Loading skeleton styles
      skeletonBg: isLight ? 'bg-light-200' : 'bg-dark-700',
      skeletonCard: isLight ? 'bg-light-100 border-light-300' : 'bg-dark-750 border-dark-600',
      skeletonContent: isLight ? 'bg-light-300' : 'bg-dark-700',

      // Error state styles
      errorBg: 'bg-red-500/10 border-red-500/30 text-red-400',
      errorButton: 'bg-red-500/20 hover:bg-red-500/30',

      // Empty state styles
      emptyIcon: isLight ? 'bg-light-200 border-light-300' : 'bg-dark-700 border-dark-600',
      emptyIconColor: isLight ? 'text-dark-500' : 'text-light-400',
      emptyTitle: isLight ? 'text-dark-800' : 'text-light-200',
      emptyText: isLight ? 'text-dark-600' : 'text-light-400',

      // Filter button styles
      filterButton: cn(
        'px-4 py-2 border text-sm transition-colors',
        // themeUtils.getButtonRoundednessClass(),
        themeUtils.getPrimaryColorClass('bg') + '/10',
        'hover:' + themeUtils.getPrimaryColorClass('bg') + '/20',
        themeUtils.getPrimaryColorClass('text'),
        themeUtils.getPrimaryColorClass('border') + '/30'
      ),
    };
  };

  const componentStyles = getComponentStyles();

  useEffect(() => {
    if (!store) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
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

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      result = result.filter((product) => product.categoryId === selectedCategory);
    }

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
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategory, sortOption]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSortOption('default');
  };

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
          <div className={cn('h-8 rounded w-32 animate-pulse', componentStyles.skeletonBg)}></div>
          <div className={cn('h-10 rounded w-64 animate-pulse', componentStyles.skeletonBg)}></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'overflow-hidden border animate-pulse shadow-lg rounded-lg',
                componentStyles.skeletonCard
              )}>
              <div className={cn('h-48', componentStyles.skeletonContent)}></div>
              <div className="p-4 space-y-3">
                <div className={cn('h-5 rounded w-3/4', componentStyles.skeletonContent)}></div>
                <div className={cn('h-4 rounded w-1/2', componentStyles.skeletonContent)}></div>
                <div className={cn('h-6 rounded w-1/3', componentStyles.skeletonContent)}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 flex justify-center">
        <div className={cn('px-6 py-5 max-w-md shadow-lg', componentStyles.errorBg)}>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <span className={cn('p-1', componentStyles.errorButton)}>
              <X size={18} />
            </span>
            Error Loading Products
          </h3>
          <p className="text-sm opacity-90 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'text-sm flex items-center gap-2 transition-colors px-4 py-2',
              componentStyles.errorButton
            )}>
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full py-8 "
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center py-16 text-center w-full"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            <div
              className={cn(
                'w-16 h-16 flex items-center justify-center mb-4 border',
                componentStyles.emptyIcon
              )}>
              <ShoppingCart className={cn('h-8 w-8', componentStyles.emptyIconColor)} />
            </div>
            <h3 className={cn('text-xl font-semibold mb-2', componentStyles.emptyTitle)}>
              No products found
            </h3>
            <p className={cn('max-w-md mb-6', componentStyles.emptyText)}>
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filter criteria'
                : "This store doesn't have any products yet"}
            </p>
            {(searchTerm || selectedCategory || sortOption !== 'default') && (
              <button onClick={handleClearFilters} className={componentStyles.filterButton}>
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-5"
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
