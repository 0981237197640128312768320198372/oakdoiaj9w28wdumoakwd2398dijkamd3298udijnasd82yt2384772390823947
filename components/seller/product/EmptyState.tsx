import React from 'react';
import { Package, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddProduct: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full scale-[1.8] blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-full">
            <Package size={48} className="text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Products Yet</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        Start adding products to your store to begin selling and growing your business.
      </p>

      <button
        onClick={onAddProduct}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm rounded-full px-6 py-3 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
        <Plus size={18} />
        <span>Create First Product</span>
      </button>
    </div>
  );
};

export default EmptyState;
