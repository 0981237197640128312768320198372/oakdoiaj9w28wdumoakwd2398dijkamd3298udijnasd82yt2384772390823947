/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import LoadingAnimation from '../../home/general/Loading';
import { getSubdomain } from '@/lib/utils';

interface StoreContextProps {
  theme: any;
  seller: any;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

interface StoreDataProps {
  children: React.ReactNode;
}

export const StoreData = ({ children }: StoreDataProps) => {
  const [theme, setTheme] = useState(null);
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
          setError(`Store (${subdomain}) Not Exist`);
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [subdomain]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <div className="w-screen h-96 flex justify-center items-center ">
        <p className="text-light-800 tracking-widest font-thin">[ {error} ]</p>
      </div>
    );
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
