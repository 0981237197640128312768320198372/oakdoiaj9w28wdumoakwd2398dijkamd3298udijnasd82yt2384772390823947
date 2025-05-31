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
        <Card className="w-full max-w-md bg-dark-800 border-dark-700">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">Authentication Required</h3>
            <p className="text-sm text-light-400">You need to be logged in as a seller</p>
          </div>
        </Card>
      </div>
    );
  }

  const refreshSellerData = async () => {
    // This function is now a no-op since the SWR hook handles refreshing
  };

  const handleThemeChange = async (theme: ThemeType) => {
    const success = await updateTheme(theme);

    if (success && seller) {
      const updatedSeller = {
        ...seller,
        store: {
          ...seller.store,
          theme: theme,
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
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white mb-1 md:mb-2">
            Store Customization
          </h1>
          <p className="text-xs md:text-sm text-light-400">
            Customize your store's appearance and settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-800 border border-dark-700 p-1 h-9 md:h-10">
            <TabsTrigger
              value="theme"
              className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs md:text-sm font-medium h-7 md:h-8">
              <Palette className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs md:text-sm font-medium h-7 md:h-8">
              <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden xs:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-6">
            {isLoadingTheme ? (
              <Card className="bg-dark-800 border-dark-700">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-sm text-light-400">Loading theme...</p>
                  </div>
                </div>
              </Card>
            ) : themeError ? (
              <div className="space-y-4">
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400 text-sm">
                    {themeError}. Using default settings.
                  </AlertDescription>
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
              <Card className="bg-dark-800 border-dark-700">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-3" />
                    <p className="text-sm text-light-400">No theme data available</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <EditProfile
              theme={currentTheme}
              seller={seller}
              onProfileUpdated={refreshSellerData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
