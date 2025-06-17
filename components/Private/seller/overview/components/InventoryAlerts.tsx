/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useMemo } from 'react';
import { AlertTriangle, Package, Link2Off, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';

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

  const getAlertStyles = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'critical':
        return {
          dot: 'bg-red-500',
          text: 'text-red-400',
          bg: 'bg-red-500/5',
          border: 'border-red-500/20',
        };
      case 'warning':
        return {
          dot: 'bg-yellow-500',
          text: 'text-yellow-400',
          bg: 'bg-yellow-500/5',
          border: 'border-yellow-500/20',
        };
      case 'info':
        return {
          dot: 'bg-blue-500',
          text: 'text-blue-400',
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/20',
        };
      default:
        return {
          dot: 'bg-light-500',
          text: 'text-light-400',
          bg: 'bg-light-500/5',
          border: 'border-light-500/20',
        };
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

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        const Icon = alert.icon;

        return (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${styles.bg} ${styles.border}`}>
            <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                <Icon className={`w-4 h-4 ${styles.text}`} />
                <span className="text-xs font-medium text-light-200">{alert.count}</span>
              </div>

              <span className="text-xs text-light-400 truncate">{alert.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
