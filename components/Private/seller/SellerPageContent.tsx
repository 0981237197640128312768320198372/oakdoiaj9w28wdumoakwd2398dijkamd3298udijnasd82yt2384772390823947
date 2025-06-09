/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import React, { useState, useEffect } from 'react';
import SellerNavbar from './SellerNavbar';
import SellerOrders from './SellerOrders';
import SellerAnalytics from './SellerAnalytics';
import SellerInfo from './profile/SellerInfo';
import SellerProducts from './product/SellerProducts';
import CustomizeYourPage from './profile/CustomizeYourPage';
import AuthSellerPage from './AuthSellerPage';

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
      case 'profile':
        return <SellerInfo />;
      case 'edit-profile':
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
        return <SellerInfo />;
    }
  };
  return (
    <>
      <SellerNavbar />
      <div className="flex flex-col justify-start w-full min-h-screen items-center px-5 xl:px-0 max-w-screen-lg ">
        <div
          className={`mt-20 w-full transition-all duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}>
          {renderActiveComponent()}
        </div>
      </div>
    </>
  );
};

export default SellerPageContent;
