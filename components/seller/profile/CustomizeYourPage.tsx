/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { useSellerAuth } from '@/context/SellerAuthContext';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ThemeType } from '@/types';

const ThemeCustomizer = dynamic(() => import('@/components/seller/profile/ThemeCustomizer'));
const EditProfile = dynamic(() => import('@/components/seller/profile/EditProfile'));

export default function CustomizeYourPage() {
  const { seller, login } = useSellerAuth();
  const [activeTab, setActiveTab] = useState<string>('theme');
  const [currentTheme, setCurrentTheme] = useState<ThemeType | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Default theme structure
  const getDefaultTheme = (): ThemeType => ({
    sellerId: seller?._id || '',
    baseTheme: 'dark',
    customizations: {
      colors: {
        primary: 'primary',
        secondary: 'bg-dark-800',
      },
      button: {
        textColor: 'text-dark-800',
        backgroundColor: 'bg-primary',
        roundedness: 'md',
        shadow: 'sm',
        border: 'none',
        borderColor: 'border-primary',
      },
      componentStyles: {
        cardRoundedness: 'md',
        cardShadow: 'sm',
      },
      ads: {
        images: [],
        roundedness: 'md',
        shadow: 'sm',
      },
    },
  });

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
          if (response.status === 404) {
            const defaultTheme = getDefaultTheme();
            setCurrentTheme(defaultTheme);
            return;
          }
          throw new Error('Failed to fetch theme data');
        }

        const themeData: ThemeType = await response.json();

        const completeTheme: ThemeType = {
          sellerId: themeData.sellerId || seller._id || '',
          baseTheme: themeData.baseTheme || 'dark',
          customizations: {
            colors: {
              primary: themeData.customizations?.colors?.primary || 'primary',
              secondary: themeData.customizations?.colors?.secondary || 'bg-dark-800',
            },
            button: {
              textColor: themeData.customizations?.button?.textColor || 'text-dark-800',
              backgroundColor: themeData.customizations?.button?.backgroundColor || 'bg-primary',
              roundedness: themeData.customizations?.button?.roundedness || 'md',
              shadow: themeData.customizations?.button?.shadow || 'sm',
              border: themeData.customizations?.button?.border || 'none',
              borderColor: themeData.customizations?.button?.borderColor || 'border-primary',
            },
            componentStyles: {
              cardRoundedness: themeData.customizations?.componentStyles?.cardRoundedness || 'md',
              cardShadow: themeData.customizations?.componentStyles?.cardShadow || 'sm',
            },
            ads: {
              images: themeData.customizations?.ads?.images || [],
              roundedness: themeData.customizations?.ads?.roundedness || 'md',
              shadow: themeData.customizations?.ads?.shadow || 'sm',
            },
          },
        };

        setCurrentTheme(completeTheme);
      } catch (error) {
        console.error('Error fetching theme:', error);
        setThemeError('Failed to load theme data');
        const defaultTheme = getDefaultTheme();
        setCurrentTheme(defaultTheme);
      } finally {
        setIsLoadingTheme(false);
      }
    };

    fetchCurrentTheme();
  }, [seller]);

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

  const refreshSellerData = () => {
    if (seller?.username) {
      const fetchTheme = async () => {
        try {
          const response = await fetch('/api/v3/seller/theme', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: seller.username }),
          });

          if (response.ok) {
            const themeData: ThemeType = await response.json();
            setCurrentTheme(themeData);
          }
        } catch (error) {
          console.error('Error refreshing theme:', error);
        }
      };
      fetchTheme();
    }
  };

  const handleThemeChange = async (theme: ThemeType) => {
    try {
      const token = localStorage.getItem('sellerToken');
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

      setCurrentTheme(theme);

      if (seller) {
        const updatedSeller = {
          ...seller,
          store: {
            ...seller.store,
            theme: theme,
          },
        };
        localStorage.setItem('seller', JSON.stringify(updatedSeller));
      }

      if (token) {
        login(token);
      }
    } catch (err) {
      console.error('Error updating theme:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Store Customization</h1>
          <p className="text-sm text-light-400">Customize your store's appearance and settings</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-800 border border-dark-700 p-1 h-10">
            <TabsTrigger
              value="theme"
              className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-sm font-medium h-8">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-sm font-medium h-8">
              <User className="h-4 w-4 mr-2" />
              Profile
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
