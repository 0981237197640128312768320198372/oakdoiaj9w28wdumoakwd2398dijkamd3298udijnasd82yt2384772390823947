/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface SalesChartProps {
  seller: any;
}

export function SalesChart({ seller }: SalesChartProps) {
  // Mock data for now - replace with real data later
  const mockData = [
    { day: 'Mon', sales: 0 },
    { day: 'Tue', sales: 0 },
    { day: 'Wed', sales: 0 },
    { day: 'Thu', sales: 0 },
    { day: 'Fri', sales: 0 },
    { day: 'Sat', sales: 0 },
    { day: 'Sun', sales: 0 },
  ];

  const totalSales = mockData.reduce((sum, item) => sum + item.sales, 0);
  const trend = 0; // Calculate trend percentage

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
        {mockData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-primary/20 rounded-sm min-h-[2px]"
              style={{
                height: `${Math.max(
                  (item.sales / Math.max(...mockData.map((d) => d.sales), 1)) * 100,
                  2
                )}%`,
              }}
            />
            <span className="text-xs text-light-500">{item.day}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-light-500 text-center">Last 7 days</p>
    </div>
  );
}
