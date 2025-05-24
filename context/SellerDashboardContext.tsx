'use client';

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

  return (
    <SellerDashboardContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </SellerDashboardContext.Provider>
  );
};

// Create a custom hook for using the context
export const useSellerDashboard = () => useContext(SellerDashboardContext);
