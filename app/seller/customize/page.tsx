'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EditProfile from '@/components/seller/profile/EditProfile';
import ThemeCustomizer from '@/components/seller/ThemeCustomizer';
import { Card, CardContent } from '@/components/ui/card';
import { useSellerAuth } from '@/context/SellerAuthContext';
import React from 'react';

const CustomizeYourPage = () => {
  const { seller, login } = useSellerAuth();

  if (!seller) {
    return (
      <Card className="w-full max-w-screen-lg opacity-0 transition-opacity duration-500 ">
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">You are not logged in as a seller</p>
        </CardContent>
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

      // Update the seller data in local storage
      const updatedSeller = { ...seller, store: { ...seller.store, theme } };
      localStorage.setItem('seller', JSON.stringify(updatedSeller));

      // Update the seller context
      login(token);

      refreshSellerData();
    } catch (err) {
      console.error('Error updating theme:', err);
    }
  };
  return (
    <div>
      <ThemeCustomizer seller={seller} onThemeChange={handleThemeChange} />
      <EditProfile seller={seller} onProfileUpdated={refreshSellerData} />
    </div>
  );
};

export default CustomizeYourPage;
