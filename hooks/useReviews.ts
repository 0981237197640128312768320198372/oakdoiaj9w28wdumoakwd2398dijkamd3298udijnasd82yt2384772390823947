import { useState, useCallback } from 'react';
import useSWR from 'swr';

interface PendingReview {
  _id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  orderTotal: number;
  createdAt: string;
  sellerId: {
    store: {
      name: string;
      logoUrl?: string;
    };
  };
}

interface ReviewStats {
  pendingReviews: number;
  productReviews: number;
  sellerReviews: number;
  totalReviews: number;
}

interface SubmittedReview {
  _id: string;
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: {
    title: string;
    images: string[];
  };
  sellerId: {
    store: {
      name: string;
      logoUrl?: string;
    };
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useReviews = (buyerId: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch pending reviews
  const {
    data: pendingData,
    error: pendingError,
    mutate: mutatePending,
  } = useSWR(buyerId ? `/api/v3/reviews?buyerId=${buyerId}&type=pending` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  // Fetch review stats
  const {
    data: statsData,
    error: statsError,
    mutate: mutateStats,
  } = useSWR(buyerId ? `/api/v3/reviews?buyerId=${buyerId}&type=stats` : null, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch submitted reviews
  const {
    data: submittedData,
    error: submittedError,
    mutate: mutateSubmitted,
  } = useSWR(buyerId ? `/api/v3/reviews?buyerId=${buyerId}&type=submitted` : null, fetcher, {
    refreshInterval: 60000,
  });

  const pendingReviews: PendingReview[] = pendingData?.data || [];
  const reviewStats: ReviewStats = statsData?.data || {
    pendingReviews: 0,
    productReviews: 0,
    sellerReviews: 0,
    totalReviews: 0,
  };
  const submittedReviews: SubmittedReview[] = submittedData?.data || [];

  const submitReview = useCallback(
    async (data: { orderId: string; rating: number; comment: string; reviewType: 'product' }) => {
      if (!buyerId) {
        throw new Error('Buyer ID is required');
      }

      // SIMPLIFIED: Only allow product reviews
      if (data.reviewType !== 'product') {
        throw new Error('Only product reviews are allowed');
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const response = await fetch(`/api/v3/reviews?type=product`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: data.orderId,
            rating: data.rating,
            comment: data.comment,
            buyerId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit review');
        }

        // Refresh all review data
        await Promise.all([mutatePending(), mutateStats(), mutateSubmitted()]);

        return result.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
        setSubmitError(errorMessage);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [buyerId, mutatePending, mutateStats, mutateSubmitted]
  );

  const refreshReviews = useCallback(async () => {
    await Promise.all([mutatePending(), mutateStats(), mutateSubmitted()]);
  }, [mutatePending, mutateStats, mutateSubmitted]);

  const hasPendingReviews = pendingReviews.length > 0;
  const isLoading = !pendingData && !pendingError;
  const error = pendingError || statsError || submittedError;

  return {
    // Data
    pendingReviews,
    submittedReviews,
    reviewStats,

    // States
    isLoading,
    isSubmitting,
    error,
    submitError,
    hasPendingReviews,

    // Actions
    submitReview,
    refreshReviews,

    // Mutations for manual refresh
    mutatePending,
    mutateStats,
    mutateSubmitted,
  };
};

// Hook for product reviews (for store pages)
export const useProductReviews = (productId: string | null) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: reviewsData,
    error: reviewsError,
    mutate: mutateReviews,
  } = useSWR(
    productId
      ? `/api/v3/reviews?productId=${productId}&type=product&page=${page}&limit=${limit}`
      : null,
    fetcher
  );

  const {
    data: statsData,
    error: statsError,
    mutate: mutateStats,
  } = useSWR(productId ? `/api/v3/reviews?productId=${productId}&type=stats` : null, fetcher);

  const reviews = reviewsData?.data || [];
  const stats = statsData?.data || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    },
  };

  // Add debugging for the stats data
  console.log('useProductReviews - Raw statsData from API:', statsData);
  console.log('useProductReviews - Processed stats:', stats);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const refresh = useCallback(async () => {
    setPage(1);
    await Promise.all([mutateReviews(), mutateStats()]);
  }, [mutateReviews, mutateStats]);

  return {
    reviews,
    stats,
    page,
    isLoading: !reviewsData && !reviewsError,
    error: reviewsError || statsError,
    loadMore,
    refresh,
    hasMore: reviews.length === limit, // Simple check, could be improved
  };
};

// Hook for seller reviews (for seller dashboard and public store profile)
export const useSellerReviews = (sellerId: string | null) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: reviewsData,
    error: reviewsError,
    mutate: mutateReviews,
  } = useSWR(
    sellerId
      ? `/api/v3/reviews?sellerId=${sellerId}&type=seller&page=${page}&limit=${limit}`
      : null,
    fetcher
  );

  const {
    data: statsData,
    error: statsError,
    mutate: mutateStats,
  } = useSWR(sellerId ? `/api/v3/reviews?sellerId=${sellerId}&type=stats` : null, fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  const reviews = reviewsData?.data || [];
  const stats = statsData?.data || {
    averageRating: 0,
    totalReviews: 0,
  };

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const refresh = useCallback(async () => {
    setPage(1);
    await Promise.all([mutateReviews(), mutateStats()]);
  }, [mutateReviews, mutateStats]);

  return {
    reviews,
    stats,
    page,
    isLoading: !reviewsData && !reviewsError,
    error: reviewsError || statsError,
    loadMore,
    refresh,
    hasMore: reviews.length === limit,
  };
};
