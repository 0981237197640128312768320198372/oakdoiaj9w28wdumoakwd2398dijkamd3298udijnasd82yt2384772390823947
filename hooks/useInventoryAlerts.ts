/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from 'swr';

interface InventoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  count: number;
  products?: string[];
}

interface InventoryAlertsSummary {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  drafts: number;
  unlinked: number;
}

interface UseInventoryAlertsReturn {
  alerts: InventoryAlert[];
  summary: InventoryAlertsSummary | undefined;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useInventoryAlerts(username: string | null): UseInventoryAlertsReturn {
  const { data, error, isLoading, mutate } = useSWR(
    username ? `/api/v3/seller/inventory-alerts?username=${username}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  );

  return {
    alerts: data?.data?.alerts || [],
    summary: data?.data?.summary,
    isLoading,
    error,
    mutate,
  };
}
