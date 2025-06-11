/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/hooks/useBuyerAuth';

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}

interface UseBuyerOrderStatsReturn {
  orderStats: OrderStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBuyerOrderStats(): UseBuyerOrderStatsReturn {
  const { buyer, isAuthenticated } = useBuyerAuth();
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderStats = async () => {
    if (!isAuthenticated || !buyer) {
      setOrderStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all orders for the buyer
      const response = await fetch(`/api/v3/orders/history?buyerId=${buyer.id}&limit=1000`);

      if (!response.ok) {
        throw new Error('Failed to fetch order statistics');
      }

      const data = await response.json();
      const orders = data.orders || [];

      // Calculate statistics
      const stats: OrderStats = {
        totalOrders: orders.length,
        completedOrders: orders.filter((order: { status: string }) => order.status === 'completed')
          .length,
        pendingOrders: orders.filter(
          (order: { status: string }) => order.status === 'pending' || order.status === 'confirmed'
        ).length,
        cancelledOrders: orders.filter(
          (order: { status: string }) => order.status === 'cancelled' || order.status === 'refunded'
        ).length,
      };

      setOrderStats(stats);
    } catch (err) {
      console.error('Error fetching order stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order statistics');
      setOrderStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStats();
  }, [isAuthenticated, buyer?.id]);

  return {
    orderStats,
    loading,
    error,
    refetch: fetchOrderStats,
  };
}
