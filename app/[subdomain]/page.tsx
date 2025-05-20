// app/[subdomain]/page.tsx
'use client';

import { useTheme } from '@/components/seller/SellerTheme';
import React from 'react';

interface StorePageProps {
  params: {
    subdomain: string;
  };
}

const StorePage = ({ params }: StorePageProps) => {
  const { theme } = useTheme();

  return <h2 style={{ color: theme?.primaryColor || 'inherit' }}>Store: {params.subdomain}</h2>;
};

export default StorePage;
