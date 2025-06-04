'use client';
import React, { useState } from 'react';
import SellerProductCard from './SellerProductCard';
import { Product, Category } from '@/types';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RefreshCw,
  Package,
  Tag,
  Calendar,
  BarChart3,
  ShoppingBag,
  DollarSign,
} from 'lucide-react';
import { Button2 } from '@/components/ui/button2';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onManageData: (product: Product) => void;
  isLoading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onEdit,
  onDelete,
  onManageData,
  isLoading,
}) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;

  // Get unique categories used by products
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.categoryId))
  ).filter(Boolean);
  const totalCategories = uniqueCategories.length;

  const totalStock = products.reduce((sum, product) => sum + (product._stock || 0), 0);

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearch =
      searchTerm === '' ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;

    // Status filter
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.status === 'active') ||
      (statusFilter === 'draft' && product.status !== 'active');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh - in a real app, you would fetch fresh data here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Loading skeleton for products
  const ProductSkeleton = () => (
    <div className="bg-dark-800 rounded-xl overflow-hidden shadow-sm border border-dark-700 animate-pulse">
      <div className="h-48 bg-dark-600"></div>
      <div className="p-5">
        <div className="h-6 bg-dark-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-dark-600 rounded w-full mb-1"></div>
        <div className="h-4 bg-dark-600 rounded w-2/3 mb-4"></div>
        <div className="flex justify-between pt-2 border-t border-dark-100 dark:border-dark-700">
          <div className="h-4 bg-dark-600 rounded w-1/3"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-dark-600 rounded-full"></div>
            <div className="h-8 w-8 bg-dark-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Total Products Card */}
        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Total Products</h3>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Package size={18} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">{totalProducts}</p>
          <div className="mt-2 text-xs text-light-500">
            {filteredProducts.length} products in current view
          </div>
        </div>

        {/* Active Products Card */}
        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Active Products</h3>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <ShoppingBag size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">{activeProducts}</p>
          <div className="mt-2 text-xs text-light-500">
            {activeProducts > 0
              ? `${Math.round((activeProducts / totalProducts) * 100)}% of products active`
              : 'No active products'}
          </div>
          {totalProducts > 0 && (
            <div className="mt-2 w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((activeProducts / totalProducts) * 100)}%` }}></div>
            </div>
          )}
        </div>

        {/* Categories Card */}
        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Total Categories</h3>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Tag size={18} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">{totalCategories}</p>
          <div className="mt-2 text-xs text-light-500">
            {totalCategories > 0 && categories.length > 0
              ? `${Math.round(
                  (totalCategories / categories.length) * 100
                )}% of available categories used`
              : 'No categories used'}
          </div>
          {categories.length > 0 && (
            <div className="mt-2 w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((totalCategories / categories.length) * 100)}%`,
                }}></div>
            </div>
          )}
        </div>

        {/* Total Stock Card */}
        <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
          <div className="flex items-center justify-between">
            <h3 className="text-light-300 text-sm font-medium">Total Stock</h3>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <BarChart3 size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-light-100 mt-2">{totalStock}</p>
          <div className="mt-2 text-xs text-light-500">
            {totalProducts > 0
              ? `${(totalStock / totalProducts).toFixed(1)} items per product (avg)`
              : 'No products created yet'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="w-full space-y-3 mb-6">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="pl-10 pr-10 py-2.5 w-full bg-dark-600 border border-dark-400 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-500 hover:text-light-300"
                  aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative flex-1 min-w-[180px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2.5 w-full bg-dark-600 border-dark-400 border hover:text-primary rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
                size={16}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L2 4H10L6 8Z" fill="currentColor" className="text-light-500" />
                </svg>
              </div>
            </div>

            <div className="relative flex-1 min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2.5 w-full bg-dark-600 border-dark-400 border hover:text-primary rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                <option value="all">All status</option>
                <option value="active">Active only</option>
                <option value="draft">Draft only</option>
              </select>
              <Tag
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
                size={16}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L2 4H10L6 8Z" fill="currentColor" className="text-light-500" />
                </svg>
              </div>
            </div>

            <Button2
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-10 px-3 text-light-400 hover:text-primary transition-colors rounded-lg bg-dark-600 border border-dark-400 flex items-center gap-1 ${
                showAdvancedFilters ? 'bg-dark-600 text-primary border-primary/30' : ''
              }`}
              title="Advanced filters">
              <SlidersHorizontal size={16} />
              <span className="text-sm hidden sm:inline">Filters</span>
            </Button2>

            <Button2
              variant="outline"
              onClick={handleRefresh}
              className="h-10 w-10 p-2.5 text-light-400 hover:text-primary transition-colors rounded-lg bg-dark-600 border border-dark-400"
              title="Refresh data">
              <RefreshCw
                size={18}
                className={`${isRefreshing ? 'animate-spin' : 'hover:animate-spin'}`}
              />
            </Button2>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvancedFilters && (
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-light-200">Advanced Filters</h3>
              <Button2
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(false)}
                className="h-7 px-2 text-xs text-light-500 hover:text-light-300">
                <X size={14} className="mr-1" />
                Close
              </Button2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                  <Calendar size={12} />
                  Date Added
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                  <option value="any">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>

              {/* Price range filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                  <DollarSign size={12} />
                  Price Range
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                  <option value="any">Any price</option>
                  <option value="low">Low (0-50)</option>
                  <option value="medium">Medium (51-200)</option>
                  <option value="high">High (201+)</option>
                </select>
              </div>

              {/* Sort order */}
              <div className="space-y-2">
                <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                  <SlidersHorizontal size={12} />
                  Sort By
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="stock_desc">Stock (High to Low)</option>
                  <option value="stock_asc">Stock (Low to High)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end mt-4 pt-3 border-t border-dark-600 gap-2">
              <Button2
                variant="outline"
                size="sm"
                className="h-9 text-xs bg-dark-700 text-light-400 border-dark-600 hover:bg-dark-600 order-2 sm:order-1">
                Reset Filters
              </Button2>
              <Button2
                size="sm"
                className="h-9 text-xs bg-primary hover:bg-primary order-1 sm:order-2">
                Apply Filters
              </Button2>
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, index) => <ProductSkeleton key={index} />)
          : filteredProducts.map((product) => (
              <SellerProductCard
                key={product._id}
                product={product}
                categories={categories}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageData={onManageData}
              />
            ))}
      </div>

      {/* Empty state for filtered results */}
      {!isLoading && filteredProducts.length === 0 && products.length > 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-dark-700/50 p-4 rounded-full mb-4">
            <Search size={32} className="text-light-500" />
          </div>
          <h3 className="text-lg font-medium text-light-200 mb-2">
            No products match your filters
          </h3>
          <p className="text-light-500 max-w-md mb-4">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <Button2
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setShowAdvancedFilters(false);
            }}
            className="text-primary border-primary/30">
            Clear all filters
          </Button2>
        </div>
      )}
    </div>
  );
};

export default ProductList;
