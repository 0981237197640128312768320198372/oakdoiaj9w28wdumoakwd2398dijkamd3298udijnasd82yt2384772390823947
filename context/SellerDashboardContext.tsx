/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { consoleFuck } from '@/lib/utils';
import React, { createContext, useContext, useState, ReactNode } from 'react';
interface SellerDashboardContextType {
  activeView: any;
  setActiveView: (view: any) => void;
}

// Create the context with default values
const SellerDashboardContext = createContext<SellerDashboardContextType>({
  activeView: 'overview',
  setActiveView: () => {},
});

// Create a provider component
export const SellerDashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState('overview');
  console.log(
    `%c${consoleFuck}`,
    'display: inline-block; width: 64px; height: 64px; text-align: center; line-height: 64px; font-size: 32px; color: white; background: #0f0f0f; padding: 10px; font-weight: bold; border-radius: 10px;'
  );
  return (
    <SellerDashboardContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </SellerDashboardContext.Provider>
  );
};

// Create a custom hook for using the context
export const useSellerDashboard = () => useContext(SellerDashboardContext);
