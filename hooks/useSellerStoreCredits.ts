'use client';

import { useState, useEffect, useCallback } from 'react';

export interface StoreCreditStats {
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  positivePercentage: number;
}

export const useSellerStoreCredits = (sellerId: string | null) => {
  const [stats, setStats] = useState<StoreCreditStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!sellerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v3/store-credits?sellerId=${sellerId}&type=stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching store credit stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  // Fetch data on mount and when sellerId changes
  useEffect(() => {
    if (sellerId) {
      fetchStats();
    }
  }, [sellerId, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};
