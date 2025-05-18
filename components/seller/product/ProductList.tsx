import React from 'react';
import { Search } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-dark-100" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200  bg-dark-700 text-light-400 focus:outline-none focus:ring-[1px] focus:ring-primary  transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(6)
              .fill(0)
              .map((_, index) => <ProductSkeleton key={index} />)
          : products.map((product) => (
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
