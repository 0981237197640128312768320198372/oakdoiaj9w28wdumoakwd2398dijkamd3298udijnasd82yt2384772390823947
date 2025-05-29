/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingBag } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';

const SellerAnalytics = () => {
  const { seller } = useSellerAuth();

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-light-100">Store Analytics</h1>
        <div className="flex gap-2">
          <button className="bg-dark-600 hover:bg-dark-500 text-light-100 text-sm rounded-full px-4 py-2 font-bold border border-dark-400 transition-all duration-300">
            This Week
          </button>
          <button className="bg-dark-600 hover:bg-dark-500 text-light-100 text-sm rounded-full px-4 py-2 font-bold border border-dark-400 transition-all duration-300">
            This Month
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AnalyticsCard
          title="Total Sales"
          value="$0.00"
          icon={<DollarSign size={24} className="text-chart-1" />}
          trend={0}
        />
        <AnalyticsCard
          title="Orders"
          value="0"
          icon={<ShoppingBag size={24} className="text-chart-2" />}
          trend={0}
        />
        <AnalyticsCard
          title="Customers"
          value="0"
          icon={<Users size={24} className="text-chart-3" />}
          trend={0}
        />
        <AnalyticsCard
          title="Growth"
          value="0%"
          icon={<TrendingUp size={24} className="text-chart-4" />}
          trend={0}
        />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-dark-600 border border-dark-400 rounded-xl p-6 flex flex-col items-center justify-center min-h-[300px]">
        <BarChart3 size={64} className="text-light-500 mb-4" />
        <h2 className="text-xl font-bold text-light-100 mb-2">No Data to Display</h2>
        <p className="text-light-500">Start selling to see your store's performance metrics.</p>
      </div>
    </div>
  );
};

// Analytics Card Component
const AnalyticsCard = ({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
}) => {
  return (
    <div className="bg-dark-600 border border-dark-400 rounded-xl p-4 transition-all duration-300 hover:border-dark-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-light-500 text-sm">{title}</h3>
        <div className="p-2 bg-dark-500 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-light-100">{value}</p>
        <div
          className={`flex items-center text-xs ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-light-500'
          }`}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '−'} {Math.abs(trend)}%
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
