/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { consoleFuck } from '@/lib/utils';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType =
  | 'overview'
  | 'products'
  | 'orders'
  | 'analytics'
  | 'edit-profile'
  | 'theme-customizer';

interface SellerDashboardContextType {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

// Create the context with default values
const SellerDashboardContext = createContext<SellerDashboardContextType>({
  activeView: 'overview',
  setActiveView: () => {},
});

// Create a provider component
export const SellerDashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  console.log(`%c${consoleFuck}`, ';');
  return (
    <SellerDashboardContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </SellerDashboardContext.Provider>
  );
};

// Create a custom hook for using the context
export const useSellerDashboard = () => useContext(SellerDashboardContext);
