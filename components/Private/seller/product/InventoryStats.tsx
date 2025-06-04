'use client';
import React from 'react';
import { Link, Link2Off, BarChart3 } from 'lucide-react';
import { HiOutlineInboxStack } from 'react-icons/hi2';

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
  // Calculate percentages for the progress bars
  const linkedPercentage =
    totalInventory > 0 ? Math.round((linkedItems / totalInventory) * 100) : 0;
  const unlinkedPercentage =
    totalInventory > 0 ? Math.round((unlinkedItems / totalInventory) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Total Inventory</h3>
          <div className="bg-primary/10 p-2 rounded-lg">
            <HiOutlineInboxStack size={18} className="text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{totalInventory}</p>
        <div className="mt-2 text-xs text-light-500">
          {totalAssets} total assets across all inventory
        </div>
      </div>

      {/* Linked Items Card */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Linked Items</h3>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Link size={18} className="text-primary" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{linkedItems}</p>
        <div className="mt-2 text-xs text-light-500">
          {linkedItems > 0
            ? `${linkedPercentage}% of inventory linked`
            : 'No items linked to products'}
        </div>
        {totalInventory > 0 && (
          <div className="mt-2 w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${linkedPercentage}%` }}></div>
          </div>
        )}
      </div>

      {/* Unlinked Items Card */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Unlinked Items</h3>
          <div className="bg-yellow-500/10 p-2 rounded-lg">
            <Link2Off size={18} className="text-yellow-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{unlinkedItems}</p>
        <div className="mt-2 text-xs text-light-500">
          {unlinkedItems > 0
            ? `${unlinkedPercentage}% of inventory unlinked`
            : 'All items are linked to products'}
        </div>
        {totalInventory > 0 && (
          <div className="mt-2 w-full bg-dark-600 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${unlinkedPercentage}%` }}></div>
          </div>
        )}
      </div>

      {/* Total Assets Card */}
      <div className="bg-gradient-to-br from-dark-700 to-dark-800 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
        <div className="flex items-center justify-between">
          <h3 className="text-light-300 text-sm font-medium">Total Assets</h3>
          <div className="bg-green-500/10 p-2 rounded-lg">
            <BarChart3 size={18} className="text-green-500" />
          </div>
        </div>
        <p className="text-2xl font-bold text-light-100 mt-2">{totalAssets}</p>
        <div className="mt-2 text-xs text-light-500">
          {totalInventory > 0
            ? `${(totalAssets / totalInventory).toFixed(1)} assets per inventory (avg)`
            : 'No inventory items created yet'}
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
