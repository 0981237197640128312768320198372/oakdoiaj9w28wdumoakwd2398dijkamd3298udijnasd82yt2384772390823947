'use client';

import * as React from 'react';
import { Package, BarChart3, ShoppingBag, Layout, LogOut } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useSellerDashboard } from '@/context/SellerDashboardContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    id: 'overview' as const,
    title: 'Overview',
    icon: Layout,
  },
  {
    id: 'products' as const,
    title: 'Products',
    icon: Package,
  },
  {
    id: 'orders' as const,
    title: 'Orders',
    icon: ShoppingBag,
  },
  {
    id: 'analytics' as const,
    title: 'Analytics',
    icon: BarChart3,
  },
];

export function SellerSidebar() {
  const { seller, logout } = useSellerAuth();
  const { activeView, setActiveView } = useSellerDashboard();

  const handleNavigation = (view: 'overview' | 'products' | 'orders' | 'analytics') => {
    setActiveView(view);
  };

  return (
    <Sidebar variant="floating" className="border-r border-dark-500 bg-dark-800">
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md">
            <Image
              src={dokmailogosquare}
              alt="Dokmai Store"
              width={32}
              height={32}
              className="h-6 w-6"
            />
          </div>
          <div className="text-xs font-aktivGroteskBold text-light-100 tracking-wide">
            Store Name
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    className={`transition-all duration-300 text-xs font-aktivGroteskBold ${
                      activeView === item.id
                        ? 'bg-primary text-dark-800 hover:bg-primary/90'
                        : 'text-light-300 hover:text-light-100 hover:bg-dark-600'
                    }`}
                    onClick={() => handleNavigation(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-dark-500 p-4">
        {seller && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-6 w-6 rounded-full overflow-hidden border border-dark-400">
                <Image
                  src={seller.store.logoUrl || dokmailogosquare}
                  alt={seller.store.name}
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col text-xs min-w-0">
                <span className="font-aktivGroteskBold text-light-100 truncate">
                  @{seller.username}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors"
              title="Logout">
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
