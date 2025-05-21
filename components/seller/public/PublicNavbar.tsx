// src/components/PublicNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface PublicNavbarProps {
  storeName: string;
  primaryColor: string;
  username: string;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  storeName,
  primaryColor,
  username,
}) => {
  return (
    <nav className="bg-dark-800 text-light-200 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href={`/${username}`} style={{ color: primaryColor }} className="text-xl font-bold">
          {storeName}
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            href={`/${username}/products`}
            style={{ color: primaryColor }}
            className="hover:text-light-100">
            Products
          </Link>
          <Link
            href={`/${username}`}
            style={{ color: primaryColor }}
            className="hover:text-light-100">
            Store Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};
