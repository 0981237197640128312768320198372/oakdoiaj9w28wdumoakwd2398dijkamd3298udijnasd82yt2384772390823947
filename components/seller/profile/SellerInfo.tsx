/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Globe, Info, Mail, MessageCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StoreHeader } from './StoreHeader';
import { cn } from '@/lib/utils';
import { SocialLinks } from './SocialLinks';
import { InfoSection } from './InfoSection';
import { StoreStats } from './StoreStats';
import Link from 'next/link';
import EditProfileButton from './EditProfileButton';
import ThemeCustomizer from '../ThemeCustomizer';

export default function SellerInfo() {
  const { seller, login } = useSellerAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isThemeCustomizerVisible, setIsThemeCustomizerVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const refreshSellerData = () => {
    // Force a refresh by reloading the page
    // In a more sophisticated app, you might want to just refresh the seller data
    window.location.reload();
  };

  if (!seller) {
    return (
      <Card className="w-full max-w-screen-lg opacity-0 transition-opacity duration-500 ">
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">You are not logged in as a seller</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
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
    <div
      className={cn(
        'w-full max-w-screen-lg transition-all duration-500 transform ',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
      <Card className="overflow-hidden bg-card text-card-foreground shadow-lg">
        <StoreHeader seller={seller} />
        <CardContent className="p-5 lg:px-0">
          <div className="flex justify-between items-start mb-4">
            <EditProfileButton seller={seller} onProfileUpdated={refreshSellerData} />
            <button
              onClick={() => setIsThemeCustomizerVisible(!isThemeCustomizerVisible)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-lg transition-colors duration-200">
              Customize Theme
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <InfoSection title="Store Information" icon={<Info className="h-5 w-5" />}>
                <p className="text-sm leading-relaxed p-3 bg-dark-700 rounded-xl">
                  {seller.store.description || 'No description available'}
                </p>
              </InfoSection>
              <InfoSection title="Seller Details" icon={<User className="h-5 w-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href={`https://${seller.username}.dokmai.store`}
                    className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-xs">
                      https://{seller.username}.dokmai.store
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-xs">{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Member since:</span>
                    <span className="font-medium text-xs">{formatDate(seller.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last updated:</span>
                    <span className="font-medium text-xs">{formatDate(seller.updatedAt)}</span>
                  </div>
                </div>
              </InfoSection>
            </div>

            <div className="space-y-6">
              <StoreStats seller={seller} />
              <InfoSection title="Contact Information" icon={<MessageCircle className="h-5 w-5" />}>
                <SocialLinks contact={seller.contact} />
              </InfoSection>
            </div>
          </div>
        </CardContent>
      </Card>

      {isThemeCustomizerVisible && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center">
          <div className="bg-dark-700 p-8 rounded-lg max-w-3xl w-full">
            <ThemeCustomizer seller={seller} onThemeChange={handleThemeChange} />
          </div>
        </div>
      )}
    </div>
  );
}
