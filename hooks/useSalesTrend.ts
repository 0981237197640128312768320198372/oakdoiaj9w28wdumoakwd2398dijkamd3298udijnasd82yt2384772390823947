/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from 'swr';

interface SalesTrendData {
  date: string;
  day: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface SalesTrendResponse {
  salesData: SalesTrendData[];
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  trend: number;
  period: string;
}

interface UseSalesTrendReturn {
  salesTrend: SalesTrendResponse | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSalesTrend(username: string | null, days: number = 7): UseSalesTrendReturn {
  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/v3/seller/sales-trend?username=${username}&days=${days}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    salesTrend: data?.data,
    isLoading,
    error,
    mutate,
  };
}
