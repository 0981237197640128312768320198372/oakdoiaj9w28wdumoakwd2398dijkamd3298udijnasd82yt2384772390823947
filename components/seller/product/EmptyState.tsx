import React from 'react';
import { Package, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddProduct: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
    <div className="bg-dark-700 rounded-xl p-10 overflow-hidden text-center shadow-sm border border-dark-500 transition-all duration-300 animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-dark-100 rounded-full scale-[1.8] blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-dark-500 to-dark-700 p-4 rounded-full">
            <Package size={48} className="text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-light-200 mb-3">No Products Yet</h2>

      <p className="text-light-500 mb-8 max-w-md mx-auto">
        Start adding products to your store to begin selling and growing your business.
      </p>

      <button
        onClick={onAddProduct}
        className="inline-flex items-center gap-2 bg-primary  text-dark-800 text-sm rounded-full px-6 py-3 font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
        <Plus size={18} />
        <span>Create First Product</span>
      </button>
    </div>
  );
};

export default EmptyState;
