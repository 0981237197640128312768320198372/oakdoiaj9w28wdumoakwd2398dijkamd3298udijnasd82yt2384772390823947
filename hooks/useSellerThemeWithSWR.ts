/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import type { ThemeType } from '@/types';

interface UseSellerThemeReturn {
  theme: ThemeType | null;
  loading: boolean;
  error: string | null;
  updateTheme: (theme: ThemeType) => Promise<boolean>;
  refreshTheme: () => Promise<void>;
}

// Fetcher function for SWR
const fetcher = async (url: string, username: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the theme data.');
    const data = await response.json();
    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

// Default theme structure
const getDefaultTheme = (sellerId: string): ThemeType => ({
  sellerId: sellerId || '',
  baseTheme: 'dark',
  customizations: {
    colors: {
      primary: 'primary',
      secondary: 'bg-dark-800',
    },
    button: {
      textColor: 'text-dark-800',
      backgroundColor: 'bg-primary',
      roundedness: 'md',
      shadow: 'sm',
      border: 'none',
      borderColor: 'border-primary',
    },
    componentStyles: {
      cardRoundedness: 'md',
      cardShadow: 'sm',
    },
    ads: {
      images: [],
      roundedness: 'md',
      shadow: 'sm',
    },
  },
});

export function useSellerThemeWithSWR(): UseSellerThemeReturn {
  const { seller } = useSellerAuth();
  const [localTheme, setLocalTheme] = useState<ThemeType | null>(null);

  // Create a unique key for SWR based on the seller username
  const swrKey = seller?.username ? ['/api/v3/seller/theme', seller.username] : null;

  // Use SWR for data fetching with deduplication and caching
  const { error, mutate, isValidating } = useSWR(
    swrKey,
    ([url, username]) => fetcher(url, username),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Deduplicate requests within 10 seconds
      onSuccess: (data) => {
        if (data) {
          setLocalTheme(data);
        } else if (seller?._id) {
          setLocalTheme(getDefaultTheme(seller._id));
        }
      },
      onError: () => {
        if (seller?._id) {
          setLocalTheme(getDefaultTheme(seller._id));
        }
      },
    }
  );

  const updateTheme = async (theme: ThemeType): Promise<boolean> => {
    if (!seller?.username) return false;

    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v3/seller/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: seller.username,
          theme: theme,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Failed to update theme:', responseData);
        return false;
      }

      // Update the local theme state
      setLocalTheme(theme);

      // Revalidate the cache
      await mutate();

      return true;
    } catch (err) {
      console.error('Error updating theme:', err);
      return false;
    }
  };

  const refreshTheme = async (): Promise<void> => {
    await mutate();
  };

  return {
    theme: localTheme,
    loading: isValidating,
    error: localTheme ? null : error ? (error as any).info?.message || 'An error occurred' : null,
    updateTheme,
    refreshTheme,
  };
}
