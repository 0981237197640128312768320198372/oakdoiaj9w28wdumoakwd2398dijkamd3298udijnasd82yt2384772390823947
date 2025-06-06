'use client';

import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import React, { useState, useEffect } from 'react';
import SellerNavbar from './SellerNavbar';
import SellerOrders from './SellerOrders';
import SellerAnalytics from './SellerAnalytics';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import SellerInfo from './profile/SellerInfo';
import SellerProducts from './product/SellerProducts';
import CustomizeYourPage from './profile/CustomizeYourPage';

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
      return <SellerLoginPrompt />;
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

// Component to prompt users to log in
const SellerLoginPrompt = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-dark-600 rounded-xl border border-dark-400 max-w-md mx-auto max-md:pt-32 pt-10">
      <UserPlus size={64} className="text-primary mb-4" />
      <h2 className="text-xl font-bold text-light-100 mb-2">Seller Account Required</h2>
      <p className="text-light-500 mb-6">
        Please log in to your seller account to access the dashboard.
      </p>
      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-dark-800 py-2 px-6 rounded-full transition-all duration-300">
        Login to Continue
      </Link>
    </div>
  );
};

export default SellerPageContent;
