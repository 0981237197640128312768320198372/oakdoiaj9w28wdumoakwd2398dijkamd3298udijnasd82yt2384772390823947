/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { useSellerAuth } from '@/context/SellerAuthContext';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeCustomizer = dynamic(() => import('@/components/seller/profile/ThemeCustomizer'));
const EditProfile = dynamic(() => import('@/components/seller/profile/EditProfile'));

export default function CustomizeYourPage() {
  const { seller, login } = useSellerAuth();
  const [activeTab, setActiveTab] = useState<string>('theme');
  const [currentTheme, setCurrentTheme] = useState<any>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentTheme = async () => {
      if (!seller?.username) return;

      setIsLoadingTheme(true);
      setThemeError(null);

      try {
        const response = await fetch('/api/v3/seller/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: seller.username }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch theme data');
        }

        const themeData = await response.json();

        // Convert the API response back to the theme structure
        const fullTheme = {
          baseTheme: seller?.store?.theme?.baseTheme || 'dark',
          customizations: {
            colors: {
              primary: themeData.primaryColor || 'primary',
              secondary: themeData.secondaryColor || 'dark-800',
            },
            button: {
              textColor: themeData.buttonTextColor || 'dark-800',
              backgroundColor: themeData.buttonBgColor || 'primary',
              roundedness: themeData.roundedness || 'md',
              shadow: themeData.shadow || 'sm',
              border: themeData.buttonBorder || 'none',
              borderColor: seller?.store?.theme?.customizations?.button?.borderColor || 'primary',
            },
            componentStyles: {
              cardRoundedness:
                seller?.store?.theme?.customizations?.componentStyles?.cardRoundedness || 'md',
              cardShadow: seller?.store?.theme?.customizations?.componentStyles?.cardShadow || 'sm',
            },
            ads: {
              images: themeData.adsImages || [],
              roundedness: seller?.store?.theme?.customizations?.ads?.roundedness || 'md',
              shadow: seller?.store?.theme?.customizations?.ads?.shadow || 'sm',
            },
          },
        };

        setCurrentTheme(fullTheme);
      } catch (error) {
        console.error('Error fetching theme:', error);
        setThemeError('Failed to load theme data');

        // Fallback to seller data if API fails
        if (seller?.store?.theme) {
          setCurrentTheme(seller.store.theme);
        }
      } finally {
        setIsLoadingTheme(false);
      }
    };

    fetchCurrentTheme();
  }, [seller]);

  if (!seller) {
    return (
      <Card className="w-full max-w-screen-lg mx-auto bg-dark-800 border border-dark-600 opacity-0 animate-in fade-in duration-300">
        <div className="flex items-center justify-center h-40 text-center p-6">
          <p className="text-light-400">You are not logged in as a seller</p>
        </div>
      </Card>
    );
  }

  const refreshSellerData = () => {
    window.location.reload();
  };

  const handleThemeChange = async (theme: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v3/seller/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: seller.username,
          theme: theme,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update theme');
      }

      // Update current theme state
      setCurrentTheme(theme);

      const updatedSeller = { ...seller, store: { ...seller.store, theme } };
      localStorage.setItem('seller', JSON.stringify(updatedSeller));
      login(token);
      refreshSellerData();
    } catch (err) {
      console.error('Error updating theme:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-light-100 mb-6 flex items-center">
        <span className="w-1.5 h-8 bg-primary-500 rounded-sm mr-3"></span>
        Customize Your Store
      </h1>

      <Tabs defaultValue="theme" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8 bg-dark-700 border border-dark-600">
          <TabsTrigger
            value="theme"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            <Palette className="w-4 h-4 mr-2" />
            Theme Customizer
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            <User className="w-4 h-4 mr-2" />
            Profile Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="theme" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            {isLoadingTheme ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-light-400">Loading theme data...</p>
                </div>
              </div>
            ) : themeError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-400 mb-2">Error: {themeError}</p>
                  <p className="text-light-500 text-sm">Using fallback theme data</p>
                </div>
              </div>
            ) : currentTheme ? (
              <ThemeCustomizer
                seller={seller}
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-light-400">No theme data available</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <EditProfile seller={seller} onProfileUpdated={refreshSellerData} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
