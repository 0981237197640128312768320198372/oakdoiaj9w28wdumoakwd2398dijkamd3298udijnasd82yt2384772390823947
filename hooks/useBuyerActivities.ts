/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  status?: string;
  userType?: 'buyer' | 'seller';
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
  getActivity: (id: string) => Promise<Activity | null>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<boolean>;
  deleteActivity: (id: string) => Promise<boolean>;
  createActivity: (activityData: any) => Promise<Activity | null>;
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyerToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchActivities = async (filters?: ActivityFilters, append = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Set default userType to buyer if not specified
      const userType = filters?.userType || 'buyer';
      params.append('userType', userType);

      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skip) params.append('skip', filters.skip.toString());

      const response = await fetch(`/api/v3/activities?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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

  const getActivity = async (id: string): Promise<Activity | null> => {
    if (!isAuthenticated) return null;

    try {
      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return data.activity;
      } else {
        setError(data.message || 'Failed to fetch activity');
        return null;
      }
    } catch (err) {
      setError('An error occurred while fetching activity');
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

      const data = await response.json();

      if (response.ok) {
        // Update the activity in the local state
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === id ? { ...activity, ...data.activity } : activity
          )
        );
        return true;
      } else {
        setError(data.message || 'Failed to update activity');
        return false;
      }
    } catch (err) {
      setError('An error occurred while updating activity');
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

      const data = await response.json();

      if (response.ok) {
        // Remove the activity from local state or mark as cancelled
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === id
              ? { ...activity, status: 'cancelled' as const, completedAt: new Date().toISOString() }
              : activity
          )
        );
        return true;
      } else {
        setError(data.message || 'Failed to delete activity');
        return false;
      }
    } catch (err) {
      setError('An error occurred while deleting activity');
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
        setActivities((prev) => [newActivity, ...prev]);

        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: prev.total + 1,
        }));

        return newActivity;
      } else {
        setError(data.message || 'Failed to create activity');
        return null;
      }
    } catch (err) {
      setError('An error occurred while creating activity');
      console.error('Create activity error:', err);
      return null;
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
    getActivity,
    updateActivity,
    deleteActivity,
    createActivity,
  };
}
