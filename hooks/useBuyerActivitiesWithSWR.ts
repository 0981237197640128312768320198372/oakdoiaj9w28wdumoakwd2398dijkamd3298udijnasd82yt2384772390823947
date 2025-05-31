/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import useSWR from 'swr';
import { useState } from 'react';
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
  status?: string;
  userType?: 'buyer' | 'seller';
  limit?: number;
  skip?: number;
  search?: string;
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
  getActivity: (id: string) => Promise<Activity | null>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<boolean>;
  deleteActivity: (id: string) => Promise<boolean>;
  createActivity: (activityData: any) => Promise<Activity | null>;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const token = localStorage.getItem('buyerToken');
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    const data = await response.json();
    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export function useBuyerActivitiesWithSWR(
  initialFilters?: ActivityFilters
): UseBuyerActivitiesReturn {
  const { isAuthenticated } = useBuyerAuth();
  const [pagination, setPagination] = useState({
    total: 0,
    limit: initialFilters?.limit || 20,
    skip: initialFilters?.skip || 0,
    hasMore: false,
  });
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const [currentFilters, setCurrentFilters] = useState<ActivityFilters>(initialFilters || {});

  // Build the query string for SWR key
  const buildQueryString = (filters: ActivityFilters) => {
    const params = new URLSearchParams();

    // Set default userType to buyer if not specified
    const userType = filters?.userType || 'buyer';
    params.append('userType', userType);

    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.search) params.append('search', filters.search);

    return params.toString();
  };

  // Create a unique key for SWR based on the filters
  const swrKey = isAuthenticated ? `/api/v3/activities?${buildQueryString(currentFilters)}` : null;

  // Use SWR for data fetching with deduplication and caching
  const { error, mutate, isValidating } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // Deduplicate requests within 5 seconds
    onSuccess: (data) => {
      setLocalActivities(data.activities);
      setPagination(data.pagination);
    },
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyerToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const refetch = async (filters?: ActivityFilters) => {
    const newFilters = { ...currentFilters, ...filters };
    setCurrentFilters(newFilters);
    await mutate();
  };

  const loadMore = async () => {
    if (pagination.hasMore && !isValidating) {
      const loadMoreFilters = {
        ...currentFilters,
        skip: pagination.skip + pagination.limit,
      };

      try {
        const response = await fetch(`/api/v3/activities?${buildQueryString(loadMoreFilters)}`, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          setLocalActivities((prev) => [...prev, ...data.activities]);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Load more error:', err);
      }
    }
  };

  const getActivity = async (id: string): Promise<Activity | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const responseData = await response.json();

      if (response.ok) {
        return responseData.activity;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Get activity error:', err);
      return null;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Update the activity in the local state
        setLocalActivities((prev) =>
          prev.map((activity) =>
            activity.id === id ? { ...activity, ...responseData.activity } : activity
          )
        );
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Update activity error:', err);
      return false;
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Log the response for debugging
        console.log('Delete activity response:', responseData);

        // Remove the activity from local state or mark as cancelled
        setLocalActivities((prev) =>
          prev.map((activity) =>
            activity.id === id
              ? { ...activity, status: 'cancelled' as const, completedAt: new Date().toISOString() }
              : activity
          )
        );
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Delete activity error:', err);
      return false;
    }
  };

  const createActivity = async (activityData: any): Promise<Activity | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await fetch('/api/v3/activities', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityData),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new activity to the beginning of the list
        const newActivity = data.activity;
        setLocalActivities((prev) => [newActivity, ...prev]);

        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        return newActivity;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Create activity error:', err);
      return null;
    }
  };

  return {
    activities: localActivities,
    loading: isValidating,
    error: error ? (error as any).info?.message || 'An error occurred' : null,
    pagination,
    refetch,
    loadMore,
    getActivity,
    updateActivity,
    deleteActivity,
    createActivity,
  };
}
