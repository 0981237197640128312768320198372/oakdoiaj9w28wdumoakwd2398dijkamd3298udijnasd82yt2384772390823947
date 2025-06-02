/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/types';
import { ShoppingCart, X, RefreshCw, ChevronDown, Filter } from 'lucide-react';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { useSearchParams } from 'next/navigation';

interface StoreProductsProps {
  store: string | undefined;
  theme: any;
}

export default function StoreProducts({ store, theme }: StoreProductsProps) {
  const searchParams = useSearchParams();
  const showDiscountedOnly = searchParams.get('discount') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<
    'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  >('default');
  const [visibleProducts, setVisibleProducts] = useState<number>(8);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
        'px-4 py-2 border text-sm transition-colors flex gap-2 items-center',
        themeUtils.getPrimaryColorClass('border') + '/30',
        themeUtils.getButtonBorderClass(),
        themeUtils.getButtonClass()
      ),

      // Sort button styles
      sortButton: cn(
        'px-3 py-1.5 border text-xs transition-colors rounded-md focus:outline-none focus:ring-0 flex items-center gap-1',
        themeUtils.getPrimaryColorClass('border') + '/30',
        themeUtils.getButtonBorderClass(),
        themeUtils.getButtonClass()
      ),

      // Category chip styles
      categoryChip: cn(
        'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
        isLight
          ? 'bg-light-200 text-dark-700 hover:bg-light-300'
          : 'bg-dark-700 text-light-200 hover:bg-dark-600'
      ),

      // Selected category chip styles
      selectedCategoryChip: cn(
        'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
        themeUtils.getPrimaryColorClass('bg'),
        isLight ? 'text-light-100' : 'text-dark-800'
      ),

      // Load more button styles
      loadMoreButton: cn(
        'mt-8 px-6 py-2 border text-sm transition-colors rounded-md flex items-center justify-center gap-2 mx-auto hover:scale-110',
        themeUtils.getButtonClass()
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
        // Fetch products
        const productsResponse = await fetch(`/api/v3/products?store=${store}`);
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        // Fetch categories
        const categoriesResponse = await fetch(`/api/v3/categories?store=${store}`);
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
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

    // Filter by discount if the discount parameter is true
    if (showDiscountedOnly) {
      result = result.filter((product) => product.discountPercentage > 0);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.categoryId));
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchTerm, selectedCategories, sortOption, showDiscountedOnly]);

  const visibleFilteredProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProducts);
  }, [filteredProducts, visibleProducts]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSortOption('default');
  };

  const handleLoadMore = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
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
      <div className="w-full min-h-screen py-8 ">
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
      className="w-full py-8 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {/* Filter and Sort Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={componentStyles.filterButton}>
              <Filter size={16} className="" />
              Filters
              <ChevronDown
                size={16}
                className={cn('ml-1 transition-transform', showFilters ? 'rotate-180' : '')}
              />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'px-4 py-2 border text-xs flex gap-2 items-center focus:outline-none focus:ring-0 transition-colors',
              themeUtils.getPrimaryColorClass('border') + '/30',
              themeUtils.getButtonBorderClass(),
              themeUtils.getButtonClass()
            )}
          />
          <div className="flex items-center gap-2">
            <span className={cn('text-sm', themeUtils.getTextColors())}>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className={cn(componentStyles.filterButton)}>
              <option value="default">Default</option>
              <option value="name-asc">Name (A to Z)</option>
              <option value="name-desc">Name (Z to A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="pt-4 border-t">
              <h3 className={cn('text-sm font-medium mb-3', themeUtils.getTextColors())}>
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => toggleCategorySelection(category._id)}
                    className={
                      selectedCategories.includes(category._id)
                        ? componentStyles.selectedCategoryChip
                        : componentStyles.categoryChip
                    }>
                    {category.name}
                    {selectedCategories.includes(category._id) && <X size={12} className="ml-1" />}
                  </button>
                ))}
              </div>

              {(selectedCategories.length > 0 || searchTerm || sortOption !== 'default') && (
                <button
                  onClick={handleClearFilters}
                  className={cn(componentStyles.filterButton, 'mt-4')}>
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Discounted Products Notice */}
      {showDiscountedOnly && filteredProducts.length > 0 && (
        <div className={cn('mb-6 flex items-center justify-between', themeUtils.getTextColors())}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm',
                themeUtils.getPrimaryColorClass('bg') + '/10',
                themeUtils.getPrimaryColorClass('text')
              )}>
              Showing discounted products only
            </span>
          </div>
          <a
            href={`/products?store=${store}`}
            className={cn('text-sm underline', themeUtils.getPrimaryColorClass('text'))}>
            View all products
          </a>
        </div>
      )}

      {/* Products Display */}
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
              {showDiscountedOnly
                ? 'No discounted products available at the moment'
                : searchTerm || selectedCategories.length > 0
                ? 'Try adjusting your search or filter criteria'
                : "This store doesn't have any products yet"}
            </p>
            {(searchTerm || selectedCategories.length > 0 || sortOption !== 'default') && (
              <button onClick={handleClearFilters} className={componentStyles.filterButton}>
                Clear All Filters
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            <motion.div
              key="grid"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden">
              {visibleFilteredProducts.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard theme={theme} product={product} category={product.category} />
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            {visibleProducts < filteredProducts.length && (
              <button onClick={handleLoadMore} className={componentStyles.loadMoreButton}>
                Load More
                <ChevronDown size={16} />
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
