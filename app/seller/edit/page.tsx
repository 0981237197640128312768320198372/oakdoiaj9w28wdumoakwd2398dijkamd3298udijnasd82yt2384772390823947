/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card } from '@/components/ui/card';
import { useSellerAuth } from '@/context/SellerAuthContext';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, User } from 'lucide-react';
import { useState } from 'react';

// Dynamic imports to improve initial load performance
const ThemeCustomizer = dynamic(() => import('@/components/seller/profile/ThemeCustomizer'));
const EditProfile = dynamic(() => import('@/components/seller/profile/EditProfile'));

export default function CustomizeYourPage() {
  const { seller, login } = useSellerAuth();
  const [activeTab, setActiveTab] = useState<string>('theme');

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

      const response = await fetch('/api/v3/seller/update-theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update theme');
      }

      // Update the seller data in local storage and context
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
            <ThemeCustomizer seller={seller} onThemeChange={handleThemeChange} />
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
