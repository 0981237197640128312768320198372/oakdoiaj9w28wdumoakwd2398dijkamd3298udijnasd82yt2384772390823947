/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

interface Activity {
  id: string;
  type: string;
  category: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  metadata: any;
  references?: any;
  visibility: 'public' | 'private' | 'restricted';
  actors: any;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface UseActivityReturn {
  loading: boolean;
  error: string | null;
  getActivity: (id: string) => Promise<Activity | null>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<boolean>;
  deleteActivity: (id: string) => Promise<boolean>;
  createActivity: (activityData: any) => Promise<Activity | null>;
}

export function useActivity(): UseActivityReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useBuyerAuth();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('buyerToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const getActivity = async (id: string): Promise<Activity | null> => {
    if (!isAuthenticated) return null;

    try {
      setLoading(true);
      setError(null);

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
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        setError(data.message || 'Failed to update activity');
        return false;
      }
    } catch (err) {
      setError('An error occurred while updating activity');
      console.error('Update activity error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v3/activities?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        setError(data.message || 'Failed to delete activity');
        return false;
      }
    } catch (err) {
      setError('An error occurred while deleting activity');
      console.error('Delete activity error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: any): Promise<Activity | null> => {
    if (!isAuthenticated) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v3/activities', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(activityData),
      });

      const data = await response.json();

      if (response.ok) {
        return data.activity;
      } else {
        setError(data.message || 'Failed to create activity');
        return null;
      }
    } catch (err) {
      setError('An error occurred while creating activity');
      console.error('Create activity error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getActivity,
    updateActivity,
    deleteActivity,
    createActivity,
  };
}
