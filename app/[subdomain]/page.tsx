/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useTheme } from '@/components/seller/StoreData';
import React from 'react';
import { cn } from '@/lib/utils';

const StorePage = () => {
  const { theme }: any = useTheme();
  const storeName = theme?.name;
  const primaryColor = theme?.primaryColor || 'inherit';
  console.log(theme);
  return (
    <h2 style={{ color: primaryColor }} className={cn('font-bold text-2xl', `text-light-200`)}>
      Hi {storeName}
    </h2>
  );
};

export default StorePage;
