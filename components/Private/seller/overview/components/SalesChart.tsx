/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useSalesTrend } from '@/hooks/useSalesTrend';

interface SalesChartProps {
  seller: any;
}

export function SalesChart({ seller }: SalesChartProps) {
  const { salesTrend, isLoading, error } = useSalesTrend(seller?.username, 7);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center h-24">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="ml-2 text-xs text-light-400">Loading sales data...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center h-24">
          <span className="text-xs text-red-400">Failed to load sales data</span>
        </div>
      </div>
    );
  }

  // Use real data or fallback to empty data
  const salesData = salesTrend?.salesData || [];
  const totalSales = salesTrend?.totalSales || 0;
  const trend = salesTrend?.trend || 0;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-light-400">Total Sales</p>
          <p className="text-sm font-medium text-white">{totalSales.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1">
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end gap-1 h-16">
        {salesData.length > 0
          ? salesData.map((item, index) => {
              const maxSales = Math.max(...salesData.map((d) => d.sales), 1);
              const heightPercentage = Math.max((item.sales / maxSales) * 100, 2);

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-sm min-h-[2px]"
                    style={{
                      height: `${heightPercentage}%`,
                    }}
                  />
                  <span className="text-xs text-light-500">{item.day}</span>
                </div>
              );
            })
          : // Show empty state when no data
            Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/10 rounded-sm h-[2px]" />
                <span className="text-xs text-light-500">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
      </div>

      <p className="text-xs text-light-500 text-center">Last 7 days</p>
    </div>
  );
}
