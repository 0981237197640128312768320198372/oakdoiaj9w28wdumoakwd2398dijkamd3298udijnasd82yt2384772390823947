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
  console.log(`%c${consoleFuck}`, ';: 10px;');
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
