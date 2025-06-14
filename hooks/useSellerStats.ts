/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from 'swr';

interface SellerStatistics {
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  completedOrders: number;
  averageOrderValue: number;
  lastUpdated: Date;
}

interface UseSellerStatsReturn {
  statistics: SellerStatistics | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSellerStats(username: string | null): UseSellerStatsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/v3/seller/stats?username=${username}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  );

  return {
    statistics: data?.data,
    isLoading,
    error,
    mutate,
  };
}
