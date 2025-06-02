'use client';
import React from 'react';
import { Database, Link, Link2Off, ShoppingBag } from 'lucide-react';

interface InventoryStatsProps {
  totalInventory: number;
  linkedItems: number;
  unlinkedItems: number;
  totalAssets: number;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalInventory,
  linkedItems,
  unlinkedItems,
  totalAssets,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Total Inventory</h3>
          <div className="bg-primary/20 p-2 rounded-lg">
            <Database size={18} className="text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{totalInventory}</p>
        <div className="mt-2 text-xs text-light-500">
          {totalAssets} total assets across all inventory
        </div>
      </div>

      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Linked Items</h3>
          <div className="bg-primary/20 p-2 rounded-lg">
            <Link size={18} className="text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{linkedItems}</p>
        <div className="mt-2 text-xs text-light-500">
          {linkedItems > 0
            ? `${Math.round((linkedItems / totalInventory) * 100)}% of inventory linked`
            : 'No items linked to products'}
        </div>
      </div>

      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Unlinked Items</h3>
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <Link2Off size={18} className="text-yellow-400" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{unlinkedItems}</p>
        <div className="mt-2 text-xs text-light-500">
          {unlinkedItems > 0
            ? `${Math.round((unlinkedItems / totalInventory) * 100)}% of inventory unlinked`
            : 'All items are linked to products'}
        </div>
      </div>

      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Assets Per Group</h3>
          <div className="bg-green-500/20 p-2 rounded-lg">
            <ShoppingBag size={18} className="text-green-400" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">
          {totalInventory > 0 ? (totalAssets / totalInventory).toFixed(1) : '0'}
        </p>
        <div className="mt-2 text-xs text-light-500">Average assets per inventory group</div>
      </div>
    </div>
  );
};

export default InventoryStats;
