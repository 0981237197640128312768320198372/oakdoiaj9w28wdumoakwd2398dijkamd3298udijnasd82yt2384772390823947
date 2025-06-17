/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Loader2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

  const statusColors = {
    pending: '#EAB308', // yellow-500
    processing: '#3B82F6', // blue-500
    completed: '#10B981', // green-500
    cancelled: '#EF4444', // red-500
  };

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  // Prepare data for Chart.js
  const chartData = {
    labels: Object.keys(statusCounts).map(
      (status) => statusLabels[status as keyof typeof statusLabels]
    ),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.values(statusColors),
        borderColor: Object.values(statusColors).map((color) => color + '80'), // Add transparency
        borderWidth: 1,
        hoverBorderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Chart.js options
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create a custom legend
      },
      tooltip: {
        backgroundColor: '#1F2937', // dark-800
        titleColor: '#F9FAFB', // light-50
        bodyColor: '#F9FAFB', // light-50
        borderColor: '#374151', // dark-600
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <div className="space-y-4">
      {/* Pie Chart */}
      <div className="relative h-40 w-full">
        <Pie data={chartData} options={options} />
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
          const color = statusColors[status as keyof typeof statusColors];
          const label = statusLabels[status as keyof typeof statusLabels];

          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-light-400 truncate">{label}</span>
                  <span className="text-xs text-white font-medium">{count}</span>
                </div>
                <div className="text-xs text-light-500">{percentage}%</div>
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
