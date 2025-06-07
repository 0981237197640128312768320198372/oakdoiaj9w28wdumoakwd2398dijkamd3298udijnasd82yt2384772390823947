'use client';

import { consoleFuck } from '@/lib/utils';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available views in the seller dashboard
export type DashboardView = 'profile' | 'products' | 'orders' | 'analytics' | 'edit-profile';

// Define the context type
interface SellerDashboardContextType {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
}

// Create the context with default values
const SellerDashboardContext = createContext<SellerDashboardContextType>({
  activeView: 'profile',
  setActiveView: () => {},
});

// Create a provider component
export const SellerDashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<DashboardView>('profile');
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
