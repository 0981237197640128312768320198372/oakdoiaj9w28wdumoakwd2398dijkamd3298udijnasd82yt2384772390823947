/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import useSWR from 'swr';
import { useState, useEffect } from 'react';
import { useBuyerAuth } from '@/context/BuyerAuthContext';

interface UseBuyerDetailsReturn {
  buyer: any;
  loading: boolean;
  error: string | null;
  updateBuyerDetails: (updates: any) => Promise<boolean>;
  refreshBuyerDetails: () => Promise<void>;
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const token = localStorage.getItem('buyerToken');
  if (!token) {
    throw new Error('Authentication token not found');
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the buyer details.');
    const data = await response.json();
    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export function useBuyerDetailsWithSWR(): UseBuyerDetailsReturn {
  const { buyer: authBuyer, isAuthenticated, login } = useBuyerAuth();
  const [localBuyer, setLocalBuyer] = useState<any>(authBuyer);

  // Create a unique key for SWR based on authentication status
  const swrKey = isAuthenticated ? '/api/v3/buyer/details' : null;

  // Use SWR for data fetching with deduplication and caching
  const { data, error, mutate, isValidating } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // Deduplicate requests within 10 seconds
    onSuccess: (data) => {
      if (data && data.buyer) {
        setLocalBuyer(data.buyer);
      }
    },
  });

  // Update local buyer when SWR data changes
  useEffect(() => {
    if (data && data.buyer) {
      setLocalBuyer(data.buyer);
    }
  }, [data]);

  const updateBuyerDetails = async (updates: any): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const token = localStorage.getItem('buyerToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v3/buyer/details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to update buyer details:', responseData);
        return false;
      }

      // If the API returns a new token, update it
      if (responseData.token) {
        login(responseData.token);
      }

      // Update the local buyer state
      if (responseData.buyer) {
        setLocalBuyer(responseData.buyer);
      }

      // Update cache immediately with new data and skip revalidation
      await mutate(responseData, false);

      return true;
    } catch (err) {
      console.error('Error updating buyer details:', err);
      return false;
    }
  };

  const refreshBuyerDetails = async (): Promise<void> => {
    await mutate();
  };

  return {
    buyer: localBuyer,
    loading: isValidating,
    error: error ? (error as any).info?.message || 'An error occurred' : null,
    updateBuyerDetails,
    refreshBuyerDetails,
  };
}
