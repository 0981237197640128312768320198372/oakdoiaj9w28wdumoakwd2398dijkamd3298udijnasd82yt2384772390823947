import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  isLoading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete, isLoading }) => {
  // Loading skeleton for products
  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
          />
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200">
          <SlidersHorizontal size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Show skeletons when loading
            Array(6)
              .fill(0)
              .map((_, index) => <ProductSkeleton key={index} />)
          : // Show actual products
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
      </div>
    </div>
  );
};

export default ProductList;
