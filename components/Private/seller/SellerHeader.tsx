'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Settings } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import { SettingsDropdown } from '@/components/Private/seller/overview/components/SettingsDropdown';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const viewTitles = {
  overview: 'Overview',
  products: 'Products',
  orders: 'Orders',
  analytics: 'Analytics',
  'edit-profile': 'Profile Settings',
};

export function SellerHeader() {
  const { seller } = useSellerAuth();
  const { activeView, setActiveView } = useSellerDashboard();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleViewChange = (view: 'theme-customizer' | 'edit-profile') => {
    setActiveView(view);
  };

  if (!seller) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-dark-500 bg-dark-800 px-4">
      <div className="flex items-center gap-4 w-full max-w-screen-2xl mx-auto">
        {/* Mobile Sidebar Trigger */}
        <SidebarTrigger className="md:hidden" />
        <Separator orientation="vertical" className="h-6 bg-dark-500 md:hidden" />

        {/* Store Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full overflow-hidden border border-dark-400 flex-shrink-0">
            <Image
              src={seller.store.logoUrl || dokmailogosquare}
              alt={seller.store.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs font-aktivGroteskBold text-light-100 truncate">
              {seller.store.name}
            </h1>
            <p className="text-xs text-light-400 truncate">@{seller.username}</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  className="text-light-400 hover:text-light-200 text-xs"
                  onClick={() => setActiveView('overview')}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-dark-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-light-100 text-xs font-aktivGroteskBold">
                  {viewTitles[activeView as keyof typeof viewTitles] || 'Dashboard'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Settings Dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-aktivGroteskBold text-light-300 hover:text-light-100 hover:bg-dark-600 rounded-lg border border-dark-500 hover:border-dark-400 transition-all duration-200">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {isSettingsOpen && (
            <SettingsDropdown
              onClose={() => setIsSettingsOpen(false)}
              seller={seller}
              onViewChange={handleViewChange}
            />
          )}
        </div>
      </div>
    </header>
  );
}
