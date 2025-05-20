/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useTheme } from '@/components/seller/SellerTheme';
import React, { useState, useEffect } from 'react';

const getSubdomain = (hostname: string): string | null => {
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0]; // e.g., 'shop' from 'shop.localhost'
    }
  } else if (hostname.endsWith('.dokmai.store')) {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'dokmai.store') {
      return parts[0];
    }
  }
  return null;
};

const StorePage = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const subdomain = getSubdomain(hostname);
    if (subdomain) {
      setSubdomain(subdomain);
    } else {
      setError('Invalid domain or no subdomain provided.');
    }
  }, []);
  const { theme } = useTheme();
  console.log(theme);
  console.log(theme?.roundedness);
  console.log(theme?.primaryColor);
  if (error) {
    return <p>{error}</p>;
  }

  if (!subdomain) {
    return <p>Loading...</p>;
  }

  return <h2 className={`text-[${theme?.primaryColor}]`}>Store: {subdomain}</h2>;
};

export default StorePage;
