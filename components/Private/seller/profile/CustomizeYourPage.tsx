/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { useSellerAuth } from '@/context/SellerAuthContext';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useSellerThemeWithSWR } from '@/hooks/useSellerThemeWithSWR';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ThemeType } from '@/types';

const ThemeCustomizer = dynamic(
  () => import('@/components/Private/seller/profile/ThemeCustomizer')
);
const EditProfile = dynamic(() => import('@/components/Private/seller/profile/EditProfile'));

export default function CustomizeYourPage() {
  const { seller, login } = useSellerAuth();
  const [activeTab, setActiveTab] = useState<string>('theme');
  const {
    theme: currentTheme,
    loading: isLoadingTheme,
    error: themeError,
    updateTheme,
  } = useSellerThemeWithSWR();

  if (!seller) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-dark-700 border border-dark-400 rounded-lg shadow-md">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-base text-light-400">
              Please log in to access seller customization.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const refreshSellerData = async () => {
    // SWR hook handles refreshing automatically.
  };

  const handleThemeChange = async (theme: ThemeType) => {
    const success = await updateTheme(theme);
    if (success && seller) {
      const updatedSeller = {
        ...seller,
        store: {
          ...seller.store,
          theme,
        },
      };
      localStorage.setItem('seller', JSON.stringify(updatedSeller));
      const token = localStorage.getItem('sellerToken');
      if (token) {
        login(token);
      }
    }
  };

  return (
    <div className="min-h-[75vh] bg-dark-800 text-light-200 rounded-xl p-4 border border-dark-600 shadow-sm hover:shadow-md transition-all duration-300 hover:border-dark-500">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Store Customization</h1>
          <p className="text-sm">Customize your store's appearance and settings.</p>
        </header>
        <Card className="bg-dark-800 border border-dark-400 rounded-lg shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-dark-800 border-b border-dark-400">
              <TabsTrigger
                value="theme"
                className="flex items-center justify-center py-2 text-sm font-medium hover:text-light-200 transition-colors duration-200 data-[state=active]:bg-dark-500 data-[state=active]:text-light-200">
                <Palette className="mr-2 h-4 w-4" />
                Theme
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="flex items-center justify-center py-2 text-sm font-medium hover:text-light-200 transition-colors duration-200 data-[state=active]:bg-dark-500 data-[state=active]:text-light-200">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="theme" className="p-6">
              {isLoadingTheme ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-dark-800 mr-3" />
                  <span className="text-base">Loading theme...</span>
                </div>
              ) : themeError ? (
                <div className="space-y-4">
                  <Alert className="bg-red-500/10 border border-red-500/20 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                      <AlertDescription className="text-sm text-red-400">
                        {themeError}. Using default settings.
                      </AlertDescription>
                    </div>
                  </Alert>
                  {currentTheme && (
                    <ThemeCustomizer
                      seller={seller}
                      currentTheme={currentTheme}
                      onThemeChange={handleThemeChange}
                    />
                  )}
                </div>
              ) : currentTheme ? (
                <ThemeCustomizer
                  seller={seller}
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-amber-500 mr-3" />
                  <span className="text-base">No theme data available</span>
                </div>
              )}
            </TabsContent>
            <TabsContent value="profile" className="p-6">
              <EditProfile
                theme={currentTheme}
                seller={seller}
                onProfileUpdated={refreshSellerData}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
