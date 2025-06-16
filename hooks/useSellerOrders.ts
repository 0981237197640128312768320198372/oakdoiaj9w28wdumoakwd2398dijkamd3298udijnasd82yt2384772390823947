/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  digitalAssets: Array<{ key: string; value: string }>;
}

interface Order {
  _id: string;
  orderId: string;
  buyer: {
    _id: string;
    name: string;
    username?: string;
    email: string;
    avatarUrl?: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    discount: number;
    total: number;
  };
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface UseSellerOrdersReturn {
  orders: Order[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSellerOrders = (
  sellerId: string | null,
  page: number = 1,
  status: string = 'all'
): UseSellerOrdersReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!sellerId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sellerId,
        page: page.toString(),
        limit: '10',
      });

      if (status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/v3/seller/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sellerId, page, status]);

  return {
    orders,
    pagination,
    loading,
    error,
    refetch: fetchOrders,
  };
};
