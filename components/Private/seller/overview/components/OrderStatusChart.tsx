/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Loader2, Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

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

  // If no orders, show empty state
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 space-y-2">
        <div className="w-16 h-16 rounded-full border-4 border-dark-600 flex items-center justify-center">
          <span className="text-xs text-light-500">No Data</span>
        </div>
        <p className="text-xs text-light-500">No orders found</p>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      textColor: 'text-yellow-400',
    },
    processing: {
      label: 'Processing',
      icon: RefreshCw,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      textColor: 'text-green-400',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      textColor: 'text-red-400',
    },
  };

  return (
    <div className="space-y-4">
      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

          return (
            <div
              key={status}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                </div>
                <span className="text-lg font-bold text-white">{count}</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-light-200">{config.label}</p>
                <p className="text-xs text-light-500">{percentage}% of total</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      <div className="text-center pt-2 border-t border-dark-600">
        <p className="text-xs text-light-500">
          Total Orders: <span className="text-white font-medium">{total}</span>
        </p>
      </div>
    </div>
  );
}
