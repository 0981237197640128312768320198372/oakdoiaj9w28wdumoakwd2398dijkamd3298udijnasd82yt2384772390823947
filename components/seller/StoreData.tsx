/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ThemeType } from '@/lib/utils';
import React, { useState, useEffect, createContext, useContext } from 'react';

interface StoreContextProps {
  theme: ThemeType | null;
  seller: any;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

interface StoreDataProps {
  children: React.ReactNode;
}

const getSubdomain = (hostname: string): string | null => {
  let domain = hostname;

  if (hostname.includes(':')) {
    domain = hostname.split(':')[0];
  }

  if (domain.endsWith('.localhost')) {
    const parts = domain.split('.');
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0];
    }
  } else if (domain.endsWith('.dokmai.store')) {
    const parts = domain.split('.');
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'dokmai.store') {
      return parts[0];
    }
  } else if (domain.includes('vercel.app')) {
    const parts = domain.split('.');
    return parts[0];
  }
  return null;
};

export const StoreData = ({ children }: StoreDataProps) => {
  const [theme, setTheme] = useState<ThemeType | null>(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const extractedSubdomain = getSubdomain(hostname);
    if (extractedSubdomain) {
      setSubdomain(extractedSubdomain);
    } else {
      setError('Invalid domain or no subdomain provided.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subdomain) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [themeResponse, sellerResponse] = await Promise.all([
            fetch('/api/v3/seller/theme', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: subdomain }),
            }),
            fetch('/api/v3/seller/details', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: subdomain }),
            }),
          ]);

          if (!themeResponse.ok || !sellerResponse.ok) {
            throw new Error('Failed to fetch data');
          }

          const themeData = await themeResponse.json();
          const sellerData = await sellerResponse.json();

          if (
            themeData &&
            sellerData &&
            typeof themeData === 'object' &&
            typeof sellerData === 'object'
          ) {
            setTheme(themeData);
            setSeller(sellerData.seller);
          } else {
            throw new Error('Invalid data received');
          }
        } catch (err) {
          setError(`Failed to load data for ${subdomain}`);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [subdomain]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <StoreContext.Provider value={{ theme, seller }}>{children}</StoreContext.Provider>;
};

export const useStoreData = (): StoreContextProps => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreData must be used within a StoreData');
  }
  return context;
};
