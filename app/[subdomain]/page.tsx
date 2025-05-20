'use client';

import { useTheme } from '@/components/seller/SellerTheme';
import React from 'react';

const StorePage = () => {
  const { theme } = useTheme();
  console.log(theme);
  const stoerName = theme?.name;
  return <h2 style={{ color: theme?.primaryColor || 'inherit' }}>Hi {stoerName}</h2>;
};

export default StorePage;
