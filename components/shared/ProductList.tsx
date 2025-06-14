'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, Category, ThemeType } from '@/types';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Tag,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import ProductCard from './ProductCard';
import { cn, formatPrice } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { AiOutlineProduct } from 'react-icons/ai';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  theme: ThemeType;
  role: 'seller' | 'buyer';
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  isLoading?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  theme,
  role,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState<
    'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  >('default');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<number>(8);

  const themeUtils = useThemeUtils(theme);
  const isSeller = role === 'seller';
  const isLight = themeUtils.baseTheme === 'light';

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;

  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.categoryId))
  ).filter(Boolean);
  const totalCategories = uniqueCategories.length;

  const totalStock = products.reduce((sum, product) => sum + (product._stock || 0), 0);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((product) => product.categoryId === categoryFilter);
    }

    if (isSeller && statusFilter !== 'all') {
      result = result.filter(
        (product) =>
          (statusFilter === 'active' && product.status === 'active') ||
          (statusFilter === 'draft' && product.status !== 'active')
      );
    }

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
  }, [products, searchTerm, categoryFilter, statusFilter, sortOption, isSeller]);

  const visibleFilteredProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleProducts);
  }, [filteredProducts, visibleProducts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleLoadMore = () => {
    setVisibleProducts((prev) => prev + 8);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortOption('default');
    setShowAdvancedFilters(false);
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

  const getComponentStyles = () => {
    return {
      container: cn(
        'space-y-5 animate-fade-in w-full p-5',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass()
      ),

      statsCard: cn(
        'rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-300 bg-dark-600 border-dark-400 hover:border-dark-300'
      ),
      statsTitle: cn('text-sm font-medium', isLight ? 'text-dark-700' : 'text-light-300'),
      statsValue: cn('text-2xl font-bold mt-2', isLight ? 'text-dark-800' : 'text-light-100'),
      statsSubtext: cn('text-xs mt-2', isLight ? 'text-dark-500' : 'text-light-500'),

      // Search and filter styles
      searchInput: cn(
        'pl-10 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1',
        isLight
          ? 'bg-light-100 border-light-300 text-dark-800 focus:ring-0 focus:bg-light-200'
          : 'bg-dark-600 border-dark-400 text-light-200 focus:ring-0 focus:bg-dark-500'
      ),
      selectInput: cn(
        'appearance-none pl-10 pr-8 py-2.5 w-full border rounded-lg text-sm focus:outline-none focus:ring-0 focus:ring-none',
        isLight
          ? 'bg-light-100 border-light-300 text-dark-800'
          : 'bg-dark-600 border-dark-400 text-light-200'
      ),
      iconColor: cn(isLight ? 'text-dark-500' : 'text-light-500'),
      filterButton: cn(
        'px-4 py-2 border text-sm transition-colors flex gap-3 items-center',
        themeUtils.getPrimaryColorClass('border') + '/30',
        themeUtils.getButtonBorderClass(),
        themeUtils.getButtonClass()
      ),

      loadMoreButton: cn(
        'mt-5 px-4 py-2 border w-full text-sm transition-colors rounded-md flex items-center justify-center gap-2',
        isLight
          ? 'bg-light-100 border-light-400 hover:!bg-light-200 hover:!border-light-600'
          : 'bg-dark-600 border-dark-400 hover:!bg-dark-500 hover:!border-dark-300'
      ),

      // Empty state
      emptyIcon: cn(
        'w-16 h-16 flex items-center justify-center mb-4 border',
        isLight ? 'bg-light-200 border-light-300' : 'bg-dark-700 border-dark-600'
      ),
      emptyIconColor: cn(isLight ? 'text-dark-500' : 'text-light-400'),
      emptyTitle: cn('text-xl font-semibold mb-2', isLight ? 'text-dark-800' : 'text-light-200'),

      // Loading skeleton
      skeletonBg: isLight ? 'bg-light-200' : 'bg-dark-700',
      skeletonCard: isLight ? 'bg-light-100 border-light-300' : 'bg-dark-750 border-dark-600',
      skeletonContent: isLight ? 'bg-light-300' : 'bg-dark-600',
    };
  };

  const styles = getComponentStyles();

  // Loading skeleton
  const ProductSkeleton = () => (
    <div
      className={cn(
        'overflow-hidden border animate-pulse shadow-lg rounded-lg',
        styles.skeletonCard
      )}>
      <div className={cn('h-48', styles.skeletonContent)}></div>
      <div className="p-4 space-y-5">
        <div className={cn('h-5 rounded w-3/4', styles.skeletonContent)}></div>
        <div className={cn('h-4 rounded w-1/2', styles.skeletonContent)}></div>
        <div className={cn('h-6 rounded w-1/3', styles.skeletonContent)}></div>
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className={styles.container}>
      {/* Skeleton for Stats Cards - Only for seller view */}
      {isSeller && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={cn('animate-pulse', styles.statsCard)}>
              <div className="h-6 rounded w-1/2 mb-2"></div>
              <div className="h-8 rounded w-full mb-2"></div>
              <div className="h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}
      {/* Skeleton for Search and Filter Section */}
      <div className="w-full space-y-5 mb-6">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap gap-5">
            <div className="relative flex-grow">
              <div className={cn('h-10 rounded w-full animate-pulse', styles.skeletonBg)}></div>
            </div>
            <div className="relative flex-1 min-w-[180px]">
              <div className={cn('h-10 rounded w-full animate-pulse', styles.skeletonBg)}></div>
            </div>
            {isSeller && (
              <div className="relative flex-1 min-w-[180px]">
                <div className={cn('h-10 rounded w-full animate-pulse', styles.skeletonBg)}></div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Skeleton for Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: visibleProducts }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  return (
    <div className={styles.container}>
      {/* Stats Cards - Only shown for seller view */}
      {isSeller && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <div className={styles.statsCard}>
            <div className="flex items-center justify-between">
              <h3 className={styles.statsTitle}>Total Products</h3>
              <div className={cn('bg-primary/10 p-2 rounded-lg')}>
                <Package size={18} className="text-primary" />
              </div>
            </div>
            <p className={styles.statsValue}>{totalProducts}</p>
            <div className={styles.statsSubtext}>
              {filteredProducts.length} products in current view
            </div>
          </div>

          {/* Active Products Card */}
          <div className={styles.statsCard}>
            <div className="flex items-center justify-between">
              <h3 className={styles.statsTitle}>Active Products</h3>
              <div className={cn('bg-green-500/10 p-2 rounded-lg')}>
                <ShoppingBag size={18} className="text-green-500" />
              </div>
            </div>
            <p className={styles.statsValue}>{activeProducts}</p>
            <div className={styles.statsSubtext}>
              {activeProducts > 0
                ? `${formatPrice((activeProducts / totalProducts) * 100)}% of products active`
                : 'No active products'}
            </div>
            {totalProducts > 0 && (
              <div
                className={cn(
                  'mt-2 w-full rounded-full h-1.5 overflow-hidden',
                  isLight ? 'bg-light-300' : 'bg-dark-600'
                )}>
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${formatPrice((activeProducts / totalProducts) * 100)}%`,
                  }}></div>
              </div>
            )}
          </div>

          {/* Categories Card */}
          <div className={styles.statsCard}>
            <div className="flex items-center justify-between">
              <h3 className={styles.statsTitle}>Total Categories</h3>
              <div className={cn('bg-purple-500/10 p-2 rounded-lg')}>
                <AiOutlineProduct size={18} className="text-purple-500" />
              </div>
            </div>
            <p className={styles.statsValue}>{totalCategories}</p>
            <div className={styles.statsSubtext}>
              {totalCategories > 0 && categories.length > 0
                ? `${formatPrice(
                    (totalCategories / categories.length) * 100
                  )}% of available categories used`
                : 'No categories used'}
            </div>
            {categories.length > 0 && (
              <div
                className={cn(
                  'mt-2 w-full rounded-full h-1.5 overflow-hidden',
                  isLight ? 'bg-light-300' : 'bg-dark-600'
                )}>
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${formatPrice((totalCategories / categories.length) * 100)}%`,
                  }}></div>
              </div>
            )}
          </div>

          {/* Total Stock Card */}
          <div className={styles.statsCard}>
            <div className="flex items-center justify-between">
              <h3 className={styles.statsTitle}>Total Stock</h3>
              <div className={cn('bg-blue-500/10 p-2 rounded-lg')}>
                <Tag size={18} className="text-blue-500" />
              </div>
            </div>
            <p className={styles.statsValue}>{totalStock}</p>
            <div className={styles.statsSubtext}>
              {totalProducts > 0
                ? `${(totalStock / totalProducts).toFixed(1)} items per product (avg)`
                : 'No products created yet'}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="w-full space-y-5 mb-5">
        {/* Mobile-first responsive layout */}
        <div className="flex flex-col gap-5 w-full">
          {/* Search Bar - Full width on mobile, flexible on larger screens */}
          <div className="relative w-full sm:flex-1">
            <Search
              className={cn('absolute left-3 top-1/2 transform -translate-y-1/2', styles.iconColor)}
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className={cn(styles.searchInput, 'w-full')}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={cn(
                  'absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-light-300',
                  styles.iconColor
                )}
                aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters Row - Stack on mobile, inline on larger screens */}
          <div className="flex flex-col sm:flex-row gap-5 w-full">
            {/* Category Filter */}
            <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.selectInput}>
                <option value="all">All categories</option>
                {categories
                  .filter((category) => uniqueCategories.includes(category._id))
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              <Filter
                className={cn(
                  'absolute left-3 top-1/2 transform -translate-y-1/2',
                  styles.iconColor
                )}
                size={16}
              />
              <div
                className={cn(
                  'absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none',
                  styles.iconColor
                )}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L2 4H10L6 8Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Status Filter - Only for seller view */}
            {isSeller && (
              <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.selectInput}>
                  <option value="all">All status</option>
                  <option value="active">Active only</option>
                  <option value="draft">Draft only</option>
                </select>
                <Tag
                  className={cn(
                    'absolute left-3 top-1/2 transform -translate-y-1/2',
                    styles.iconColor
                  )}
                  size={16}
                />
                <div
                  className={cn(
                    'absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none',
                    styles.iconColor
                  )}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L2 4H10L6 8Z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            {/* Action Buttons Row - Stack on mobile, inline on larger screens */}
            <div className="flex gap-5 w-full sm:w-auto">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  styles.filterButton,
                  'flex-1 sm:flex-none justify-center sm:justify-start',
                  showAdvancedFilters
                    ? isLight
                      ? 'bg-light-200 text-dark-800'
                      : 'bg-dark-600 text-light-200'
                    : ''
                )}
                title="Advanced filters">
                <SlidersHorizontal size={16} />
                <span className="text-xs sm:text-sm">Filters</span>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform', showAdvancedFilters ? 'rotate-180' : '')}
                />
              </button>

              <button
                onClick={handleRefresh}
                className={cn(
                  'h-10 w-10 p-2.5 transition-colors rounded-lg border flex-shrink-0',
                  isLight
                    ? 'bg-light-100 border-light-300 text-dark-600'
                    : 'bg-dark-600 border-dark-400 text-light-400'
                )}
                title="Refresh data">
                <RefreshCw
                  size={18}
                  className={`${isRefreshing ? 'animate-spin' : 'hover:animate-spin'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvancedFilters && (
          <div
            className={cn(
              'border rounded-lg p-4 animate-fadeIn',
              isLight ? 'bg-light-100 border-light-300' : 'bg-dark-800 border-dark-600'
            )}>
            <div className="flex justify-between items-center mb-3">
              <h3
                className={cn('text-sm font-medium', isLight ? 'text-dark-800' : 'text-light-200')}>
                Advanced Filters
              </h3>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className={cn(
                  'h-7 px-2 text-xs hover:text-light-300',
                  isLight ? 'text-dark-500' : 'text-light-500'
                )}>
                <X size={14} className="mr-1 inline" />
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sort order */}
              <div className="space-y-2">
                <label
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    isLight ? 'text-dark-600' : 'text-light-400'
                  )}>
                  <SlidersHorizontal size={12} />
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(
                      e.target.value as
                        | 'default'
                        | 'price-asc'
                        | 'price-desc'
                        | 'name-asc'
                        | 'name-desc'
                    )
                  }
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-0',
                    isLight
                      ? 'bg-light-200 border-light-300 text-dark-800'
                      : 'bg-dark-700 border-dark-600 text-light-200'
                  )}>
                  <option value="default">Default</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              </div>
            </div>

            <div
              className={cn(
                'flex flex-col sm:flex-row justify-end mt-4 pt-3 border-t gap-2',
                isLight ? 'border-light-300' : 'border-dark-600'
              )}>
              <button
                onClick={handleClearFilters}
                className={cn(
                  'h-9 px-4 py-2 text-xs border rounded-md order-2 sm:order-1',
                  isLight
                    ? 'bg-light-200 text-dark-600 border-light-300 hover:bg-light-300'
                    : 'bg-dark-700 text-light-400 border-dark-600 hover:bg-dark-600'
                )}>
                Reset Filters
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className={cn(
                  'h-9 px-4 py-2 text-xs rounded-md order-1 sm:order-2',
                  themeUtils.getPrimaryColorClass('bg'),
                  isLight ? 'text-light-100' : 'text-dark-800'
                )}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center py-16 text-center w-full"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden">
            <div className={styles.emptyIcon}>
              <Package className={cn('h-8 w-8', styles.emptyIconColor)} />
            </div>
            <h3 className={styles.emptyTitle}>No products found</h3>
            <p className={cn('max-w-md mb-4', isLight ? 'text-dark-600' : 'text-light-500')}>
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <button
              onClick={handleClearFilters}
              className={cn(
                'px-4 py-2 text-sm border rounded-md',
                themeUtils.getPrimaryColorClass('border'),
                isLight ? 'text-dark-800 bg-light-100' : 'text-light-100 bg-dark-800'
              )}>
              Clear all filters
            </button>
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
              {visibleFilteredProducts.map((product) => {
                // Find the category for this product
                const category = categories.find((cat) => cat._id === product.categoryId);

                return (
                  <motion.div key={product._id} variants={itemVariants}>
                    <ProductCard
                      product={product}
                      theme={theme}
                      role={role}
                      category={category}
                      onViewDetails={onViewDetails}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {visibleProducts < filteredProducts.length && (
              <button onClick={handleLoadMore} className={styles.loadMoreButton}>
                โหลดเพิ่มเติม
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductList;
