import useSWR from 'swr';

interface DetailedInsightsData {
  customerAnalytics: {
    newCustomers: number;
    returningCustomers: number;
    avgOrderValue: number;
    totalUniqueCustomers: number;
  };
  financialSummary: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    totalRevenue: number;
  };
  growthTrends: {
    ordersGrowth: number;
    revenueGrowth: number;
    customerGrowth: number;
  };
  lastUpdated: Date;
}

interface UseDetailedInsightsReturn {
  insights: DetailedInsightsData | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDetailedInsights(username: string | null): UseDetailedInsightsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/v3/seller/detailed-insights?username=${username}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    insights: data?.data,
    isLoading,
    error,
    mutate,
  };
}
