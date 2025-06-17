/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useMemo } from 'react';
import { AlertTriangle, Package, Link2Off, FileText, Loader2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface InventoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  icon: any;
  message: string;
  count: number;
  action?: string;
}

interface InventoryAlertsProps {
  seller: any;
}

export function InventoryAlerts({ seller }: InventoryAlertsProps) {
  const { alerts: rawAlerts, isLoading, error } = useInventoryAlerts(seller?.username);

  const alerts = useMemo<InventoryAlert[]>(() => {
    return rawAlerts.map((alert) => {
      let icon = Package;
      let action = '';

      switch (alert.id) {
        case 'out-of-stock':
          icon = Package;
          action = 'Restock';
          break;
        case 'low-stock':
          icon = AlertTriangle;
          action = 'Review';
          break;
        case 'unlinked':
          icon = Link2Off;
          action = 'Link';
          break;
        case 'drafts':
          icon = FileText;
          action = 'Publish';
          break;
      }

      return {
        ...alert,
        icon,
        action,
      };
    });
  }, [rawAlerts]);

  const getAlertColors = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'critical':
        return '#EF4444'; // red-500
      case 'warning':
        return '#EAB308'; // yellow-500
      case 'info':
        return '#3B82F6'; // blue-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  const getAlertLabels = (id: string) => {
    switch (id) {
      case 'out-of-stock':
        return 'Out of Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'unlinked':
        return 'Unlinked';
      case 'drafts':
        return 'Drafts';
      default:
        return id;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-light-600 mx-auto mb-2 animate-spin" />
          <p className="text-xs text-light-500">Loading inventory alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-center py-6">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-xs text-red-400">Failed to load inventory alerts</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-center py-6">
          <Package className="w-8 h-8 text-light-600 mx-auto mb-2" />
          <p className="text-xs text-light-500">All inventory looks good</p>
        </div>
      </div>
    );
  }

  const total = alerts.reduce((sum, alert) => sum + alert.count, 0);

  // Prepare data for Chart.js Pie chart
  const chartData = {
    labels: alerts.map((alert) => getAlertLabels(alert.id)),
    datasets: [
      {
        data: alerts.map((alert) => alert.count),
        backgroundColor: alerts.map((alert) => getAlertColors(alert.type)),
        borderColor: alerts.map((alert) => getAlertColors(alert.type) + '80'), // Add transparency
        borderWidth: 1,
        hoverBorderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Chart.js options for pie chart
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
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
      <div className="grid grid-cols-1 gap-2">
        {alerts.map((alert) => {
          const percentage = total > 0 ? ((alert.count / total) * 100).toFixed(1) : '0';
          const color = getAlertColors(alert.type);
          const label = getAlertLabels(alert.id);
          const Icon = alert.icon;

          return (
            <div key={alert.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <Icon className="w-4 h-4 text-light-400" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-light-400 truncate">{label}</span>
                  <span className="text-xs text-white font-medium">{alert.count}</span>
                </div>
                <div className="text-xs text-light-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
