/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { Package, Plus } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

const SellerProducts = () => {
  const { seller } = useSellerAuth();

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-100">Your Products</h1>
        <button className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white text-sm rounded-full px-4 py-2 font-bold transition-all duration-300">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Placeholder for products or empty state */}
      <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
        <Package size={64} className="mx-auto text-light-500 mb-4" />
        <h2 className="text-xl font-bold text-light-100 mb-2">No Products Yet</h2>
        <p className="text-light-500 mb-4">Start adding products to your store to begin selling.</p>
        <button className="inline-flex items-center gap-2 bg-primary/90 hover:bg-primary text-white text-sm rounded-full px-4 py-2 font-bold transition-all duration-300">
          <Plus size={16} /> Create First Product
        </button>
      </div>
    </div>
  );
};

export default SellerProducts;
