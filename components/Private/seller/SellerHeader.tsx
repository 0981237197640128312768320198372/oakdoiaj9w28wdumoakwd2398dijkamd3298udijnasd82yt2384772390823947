'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import { SettingsDropdown } from '@/components/Private/seller/overview/components/SettingsDropdown';
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
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-dark-500 bg-dark-800 px-5">
      <div className="flex items-center gap-4 w-full max-w-screen-2xl mx-auto">
        {/* Mobile Sidebar Trigger */}
        <SidebarTrigger className="md:hidden" />
        <Separator orientation="vertical" className="h-5 bg-dark-500 md:hidden" />

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
