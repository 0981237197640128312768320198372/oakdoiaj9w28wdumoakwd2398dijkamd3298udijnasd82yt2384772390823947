/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

interface Activity {
  id: string;
  type: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  metadata: {
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    transactionId?: string;
    rating?: number;
    comment?: string;
    creditType?: 'positive' | 'negative';
    creditValue?: number;
    productId?: string;
    productName?: string;
    quantity?: number;
    price?: number;
    orderId?: string;
    orderNumber?: string;
    [key: string]: any;
  };
  references?: {
    order?: string;
    product?: string;
    store?: string;
    transaction?: string;
    review?: string;
    [key: string]: string | undefined;
  };
  visibility: 'public' | 'private' | 'restricted';
  actors: {
    primary: {
      id: string;
      type: 'buyer' | 'seller' | 'system' | 'admin';
      name?: string;
    };
    secondary?: {
      id: string;
      type: 'buyer' | 'seller' | 'system' | 'admin';
      name?: string;
      seller?: any;
    };
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface ActivityFilters {
  category?: string;
  type?: string;
  limit?: number;
  skip?: number;
}

interface UseBuyerActivitiesReturn {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
  refetch: (filters?: ActivityFilters) => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useBuyerActivities(initialFilters?: ActivityFilters): UseBuyerActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false,
  });
  const { isAuthenticated } = useBuyerAuth();

  const fetchActivities = async (filters?: ActivityFilters, append = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skip) params.append('skip', filters.skip.toString());

      const token = localStorage.getItem('buyerToken');
      const response = await fetch(`/api/v3/buyer/activities?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (append) {
          setActivities((prev) => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch activities');
      }
    } catch (err) {
      setError('An error occurred while fetching activities');
      console.error('Fetch activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async (filters?: ActivityFilters) => {
    await fetchActivities({ ...initialFilters, ...filters });
  };

  const loadMore = async () => {
    if (pagination.hasMore && !loading) {
      await fetchActivities(
        {
          ...initialFilters,
          skip: pagination.skip + pagination.limit,
        },
        true
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivities(initialFilters);
    }
  }, [isAuthenticated]);

  return {
    activities,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
  };
}
