/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';

interface DetailedInsightsProps {
  seller: any;
}

export function DetailedInsights({ seller }: DetailedInsightsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-white flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Detailed Insights
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Analytics */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <Users className="w-3 h-3" />
            Customer Analytics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">New Customers</span>
              <span className="text-xs font-medium text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Returning</span>
              <span className="text-xs font-medium text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Avg. Order Value</span>
              <span className="text-xs font-medium text-white">0</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            Financial Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">This Month</span>
              <span className="text-xs font-medium text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Last Month</span>
              <span className="text-xs font-medium text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Growth</span>
              <span className="text-xs font-medium text-green-500">+0%</span>
            </div>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-dark-700 border border-dark-600 rounded-lg p-4">
          <h3 className="text-xs font-medium text-light-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            Growth Trends
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Orders Growth</span>
              <span className="text-xs font-medium text-green-500">+0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Revenue Growth</span>
              <span className="text-xs font-medium text-green-500">+0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-light-400">Customer Growth</span>
              <span className="text-xs font-medium text-green-500">+0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
