'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, ReactNode } from 'react';
import LoadingAnimation from '@/components/home/general/Loading';
import { consoleFuck } from '@/lib/utils';

interface HomeWrapperProps {
  children: ReactNode;
}

export const HomeWrapper: React.FC<HomeWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  console.log(
    `%c${consoleFuck}`,
    'display: inline-block; width: 64px; height: 64px; text-align: center; line-height: 64px; font-size: 32px; color: white; background: #0f0f0f; padding: 10px; font-weight: bold; border-radius: 10px;'
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  return <>{children}</>;
};
