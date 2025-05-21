/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PublicStoreLayout.tsx
'use client';

import React from 'react';
import { ThemeType } from '@/lib/utils';
import { PublicNavbar } from './PublicNavbar';

interface PublicStoreLayoutProps {
  theme: ThemeType;
  seller: any;
  children: React.ReactNode;
}

const PublicStoreLayout: React.FC<PublicStoreLayoutProps> = ({ theme, seller, children }) => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme?.secondaryColor,
        color: theme?.textColor,
        fontFamily: theme?.fontFamily,
      }}>
      <PublicNavbar
        storeName={seller?.store?.name}
        primaryColor={theme?.primaryColor}
        username={seller?.username}
      />
      <div className="flex flex-col items-center justify-start w-full py-20">
        <div className="w-full max-w-screen-lg px-5">{children}</div>
      </div>
    </div>
  );
};

export default PublicStoreLayout;
