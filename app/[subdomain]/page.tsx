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

  return (
    <h2 className="" style={{ color: theme?.primaryColor }}>
      Store: {params.subdomain}
    </h2>
  );
};

export default StorePage;
