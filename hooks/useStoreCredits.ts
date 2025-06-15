/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

export interface StoreCreditStats {
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  positivePercentage: number;
}

export interface UserStoreCredit {
  _id: string;
  creditType: 'positive' | 'negative';
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInfo {
  hasPurchased: boolean;
  purchaseSummary?: {
    totalOrders: number;
    totalAmount: number;
    firstPurchase: string;
    lastPurchase: string;
  };
}

export interface StoreReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
}

export const useStoreCredits = (sellerId: string | null) => {
  const { buyer, isAuthenticated } = useBuyerAuth();
  const [stats, setStats] = useState<StoreCreditStats | null>(null);
  const [userCredit, setUserCredit] = useState<UserStoreCredit | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!sellerId) return;

    try {
      const response = await fetch(`/api/v3/store-credits?sellerId=${sellerId}&type=stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching store credit stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  }, [sellerId]);

  const fetchUserCredit = useCallback(async () => {
    if (!sellerId || !buyer?.id) return;

    try {
      const token = localStorage.getItem('buyerToken');
      if (!token) return;

      const response = await fetch(`/api/v3/store-credits?sellerId=${sellerId}&type=user-credit`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) return; // Not authenticated
        throw new Error('Failed to fetch user credit');
      }

      const data = await response.json();
      setUserCredit(data.data);
    } catch (err) {
      console.error('Error fetching user credit:', err);
    }
  }, [sellerId, buyer?.id]);

  const fetchPurchaseInfo = useCallback(async () => {
    if (!sellerId) return;

    try {
      const token = localStorage.getItem('buyerToken');
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/v3/store-credits?sellerId=${sellerId}&type=purchase-check`,
        { headers }
      );

      if (!response.ok) throw new Error('Failed to fetch purchase info');

      const data = await response.json();
      setPurchaseInfo(data.data);
    } catch (err) {
      console.error('Error fetching purchase info:', err);
      setPurchaseInfo({ hasPurchased: false });
    }
  }, [sellerId]);

  const submitCredit = useCallback(
    async (creditType: 'positive' | 'negative') => {
      if (!sellerId || !buyer?.id) {
        throw new Error('Authentication required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('buyerToken');
        if (!token) throw new Error('No authentication token');

        const response = await fetch('/api/v3/store-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sellerId,
            creditType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit credit');
        }

        const data = await response.json();

        // Refresh data
        await Promise.all([fetchStats(), fetchUserCredit()]);

        return data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit credit';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sellerId, buyer?.id, fetchStats, fetchUserCredit]
  );

  const removeCredit = useCallback(async () => {
    if (!sellerId || !buyer?.id) {
      throw new Error('Authentication required');
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('buyerToken');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/v3/store-credits?sellerId=${sellerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove credit');
      }

      // Refresh data
      await Promise.all([fetchStats(), fetchUserCredit()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove credit';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sellerId, buyer?.id, fetchStats, fetchUserCredit]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (sellerId) {
      fetchStats();
      fetchPurchaseInfo();
      if (isAuthenticated) {
        fetchUserCredit();
      }
    }
  }, [sellerId, isAuthenticated, fetchStats, fetchPurchaseInfo, fetchUserCredit]);

  return {
    stats,
    userCredit,
    purchaseInfo,
    isLoading,
    error,
    submitCredit,
    removeCredit,
    refetch: useCallback(() => {
      if (sellerId) {
        fetchStats();
        fetchPurchaseInfo();
        if (isAuthenticated) {
          fetchUserCredit();
        }
      }
    }, [sellerId, isAuthenticated, fetchStats, fetchPurchaseInfo, fetchUserCredit]),
  };
};

export const useStoreReviews = (sellerId: string | null) => {
  const { buyer } = useBuyerAuth();
  const [stats, setStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!sellerId) return;

    try {
      const response = await fetch(`/api/v3/reviews?sellerId=${sellerId}&type=stats`);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching store reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    }
  }, [sellerId]);

  const fetchReviewsList = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      if (!sellerId) return;

      const loadingState = pageNum === 1 ? setIsLoading : setIsLoadingMore;
      loadingState(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v3/reviews?sellerId=${sellerId}&type=seller&page=${pageNum}&limit=5`
        );
        if (!response.ok) throw new Error('Failed to fetch reviews list');

        const data = await response.json();
        const newReviews = data.data || [];

        if (reset || pageNum === 1) {
          setReviews(newReviews);
        } else {
          setReviews((prev) => [...prev, ...newReviews]);
        }

        setHasMore(newReviews.length === 5); // If we got less than limit, no more pages
        setPage(pageNum);
      } catch (err) {
        console.error('Error fetching reviews list:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        loadingState(false);
      }
    },
    [sellerId]
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchReviewsList(page + 1, false);
    }
  }, [fetchReviewsList, page, isLoadingMore, hasMore]);

  const submitReview = useCallback(
    async (rating: number, comment: string) => {
      if (!sellerId || !buyer?.id) {
        throw new Error('Authentication required');
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('buyerToken');
        if (!token) throw new Error('No authentication token');

        const response = await fetch('/api/v3/reviews?type=seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sellerId,
            buyerId: buyer.id,
            rating,
            comment,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit review');
        }

        const data = await response.json();

        // Refresh data
        await Promise.all([fetchReviews(), fetchReviewsList(1, true)]);

        return data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [sellerId, buyer?.id, fetchReviews]
  );

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (sellerId) {
      fetchReviews();
    }
  }, [sellerId, fetchReviews]);

  return {
    stats,
    reviews,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    submitReview,
    fetchReviewsList,
    loadMore,
    refetch: fetchReviews,
  };
};
