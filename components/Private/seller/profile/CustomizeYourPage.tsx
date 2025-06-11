/* eslint-disable @typescript-eslint/no-unused-vars */
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
    <div className="space-y-8 animate-fade-in mb-5">
      <Tabs defaultValue="theme" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md mx-auto my-5 bg-dark-700 p-1 rounded-full border-[1px] border-dark-500">
          <TabsTrigger
            value="theme"
            className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-dark-800">
            <Palette size={16} className="mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-dark-800">
            <User size={16} className="mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="mt-10 animate-fadeIn">
          <div className="bg-dark-800/50 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
            <div className="bg-dark-700 rounded-xl border border-dark-500 shadow-lg overflow-hidden p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-light-100 flex items-center">
                    <Palette className="mr-2 text-primary" size={24} />
                    Theme Customizer
                  </h2>
                  <p className="text-light-400 mt-1">Customize your store's appearance and theme</p>
                </div>
              </div>

              {isLoadingTheme ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-base text-light-400">Loading theme...</span>
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
                  <span className="text-base text-light-400">No theme data available</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="mt-10 animate-fadeIn">
          <div className="bg-dark-800/50 rounded-xl border border-dark-700 shadow-lg overflow-hidden">
            <div className="bg-dark-700 rounded-xl border border-dark-500 shadow-lg overflow-hidden p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-light-100 flex items-center">
                    <User className="mr-2 text-primary" size={24} />
                    Profile Settings
                  </h2>
                  <p className="text-light-400 mt-1">Manage your store and account information</p>
                </div>
              </div>

              <EditProfile
                theme={currentTheme}
                seller={seller}
                onProfileUpdated={refreshSellerData}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
