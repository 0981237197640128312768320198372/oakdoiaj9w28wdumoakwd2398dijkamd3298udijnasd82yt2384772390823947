/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import React, { useState, useEffect } from 'react';
import { SellerSidebar } from '@/components/Private/seller/SellerSidebar';
import { SellerHeader } from '@/components/Private/seller/SellerHeader';
import SellerOrders from '@/components/Private/seller/SellerOrders';
import SellerAnalytics from '@/components/Private/seller/SellerAnalytics';
import SellerProducts from '@/components/Private/seller/product/SellerProducts';
import CustomizeYourPage from '@/components/Private/seller/profile/CustomizeYourPage';
import AuthSellerPage from '@/components/Private/seller/AuthSellerPage';
import SellerOverview from '@/components/Private/seller/overview/SellerOverview';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const SellerPageContent = () => {
  const { seller } = useSellerAuth();
  const { activeView } = useSellerDashboard();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedView, setDisplayedView] = useState(activeView);
  useEffect(() => {
    if (activeView !== displayedView) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedView(activeView);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeView, displayedView]);

  const renderActiveComponent = () => {
    if (!seller) {
      return <AuthSellerPage />;
    }
    switch (displayedView) {
      case 'overview':
        return <SellerOverview />;
      case 'edit-profile':
      case 'theme-customizer':
        return <CustomizeYourPage />;
      case 'products':
        return (
          <SellerProducts seller={seller ? { id: seller._id, name: seller.store.name } : null} />
        );
      case 'orders':
        return <SellerOrders />;
      case 'analytics':
        return <SellerAnalytics />;
      default:
        return <SellerOverview />;
    }
  };
  if (!seller) {
    return <AuthSellerPage />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-dark-800 text-white w-full">
        <SellerSidebar />
        <SidebarInset>
          <SellerHeader />
          <main className="flex-1 bg-dark-800">
            <div className="w-full max-w-screen-2xl mx-auto px-4 py-6">
              <div
                className={`w-full transition-all duration-500 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}>
                {renderActiveComponent()}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SellerPageContent;
