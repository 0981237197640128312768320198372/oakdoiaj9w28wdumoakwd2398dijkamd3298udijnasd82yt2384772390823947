/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSalesTrend } from '@/hooks/useSalesTrend';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  // Prepare data for Chart.js
  const labels =
    salesData.length > 0
      ? salesData.map((item) => item.day)
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const data = salesData.length > 0 ? salesData.map((item) => item.sales) : [0, 0, 0, 0, 0, 0, 0];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data,
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(184, 254, 19, 0.3)'); // green-500 with opacity
          gradient.addColorStop(1, 'rgba(184, 254, 19, 0.05)'); // green-500 with very low opacity
          return gradient;
        },
        borderColor: '#B9FE13', // green-500
        borderWidth: 2,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4, // Smooth curves
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937', // dark-800
        titleColor: '#F9FAFB', // light-50
        bodyColor: '#F9FAFB', // light-50
        borderColor: '#374151', // dark-600
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Sales: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF', // light-400
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151', // dark-600
        },
        ticks: {
          color: '#9CA3AF', // light-400
          font: {
            size: 10,
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

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

      {/* Line Chart */}
      <div className="relative h-16">
        <Line data={chartData} options={options} />
      </div>

      <p className="text-xs text-light-500 text-center">Last 7 days</p>
    </div>
  );
}
