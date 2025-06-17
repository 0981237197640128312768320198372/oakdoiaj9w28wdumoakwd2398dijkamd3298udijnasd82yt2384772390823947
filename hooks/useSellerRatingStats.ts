/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SellerRatingStats {
  averageRating: number;
  totalReviews: number;
}

export interface SellerReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerAvatarUrl?: string;
  buyerId?: {
    name?: string;
    email?: string;
  };
}

export const useSellerRatingStats = (sellerId: string | null) => {
  const [stats, setStats] = useState<SellerRatingStats | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatingStats = useCallback(async () => {
    if (!sellerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v3/reviews?sellerId=${sellerId}&type=stats`);
      if (!response.ok) throw new Error('Failed to fetch rating stats');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching rating stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rating stats');
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  const fetchReviews = useCallback(async () => {
    if (!sellerId) return;

    try {
      const response = await fetch(
        `/api/v3/reviews?sellerId=${sellerId}&type=seller&page=1&limit=5`
      );
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  }, [sellerId]);

  useEffect(() => {
    if (sellerId) {
      fetchRatingStats();
      fetchReviews();
    }
  }, [sellerId, fetchRatingStats, fetchReviews]);

  return {
    stats,
    reviews,
    isLoading,
    error,
    refetch: useCallback(() => {
      if (sellerId) {
        fetchRatingStats();
        fetchReviews();
      }
    }, [sellerId, fetchRatingStats, fetchReviews]),
  };
};
