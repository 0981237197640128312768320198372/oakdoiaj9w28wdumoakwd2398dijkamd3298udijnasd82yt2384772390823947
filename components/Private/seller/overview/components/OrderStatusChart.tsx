/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Loader2 } from 'lucide-react';

interface OrderStatusChartProps {
  orders: any[];
  loading: boolean;
}

export function OrderStatusChart({ orders, loading }: OrderStatusChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  const statusCounts = {
    pending: orders.filter((order) => order.status === 'pending').length,
    processing: orders.filter((order) => order.status === 'processing').length,
    completed: orders.filter((order) => order.status === 'completed').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  };

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  return (
    <div className="space-y-5">
      {/* Status Bars */}
      <div className="space-y-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-light-400 capitalize">{status}</span>
                  <span className="text-xs text-white">{count}</span>
                </div>
                <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      statusColors[status as keyof typeof statusColors]
                    } transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-xs text-light-500">Total Orders: {total}</p>
      </div>
    </div>
  );
}
