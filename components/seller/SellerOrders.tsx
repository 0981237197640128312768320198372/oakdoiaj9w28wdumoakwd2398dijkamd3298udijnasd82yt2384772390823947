/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { ShoppingBag, Filter } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

const SellerOrders = () => {
  const { seller } = useSellerAuth();

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-100">Recent Orders</h1>
        <button className="flex items-center gap-2 bg-dark-600 hover:bg-dark-500 text-light-100 text-sm rounded-full px-4 py-2 font-bold border border-dark-400 transition-all duration-300">
          <Filter size={16} /> Filter Orders
        </button>
      </div>

      {/* Placeholder for orders or empty state */}
      <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 text-center">
        <ShoppingBag size={64} className="mx-auto text-light-500 mb-4" />
        <h2 className="text-xl font-bold text-light-100 mb-2">No Orders Yet</h2>
        <p className="text-light-500 mb-4">When customers place orders, they will appear here.</p>
      </div>
    </div>
  );
};

export default SellerOrders;
