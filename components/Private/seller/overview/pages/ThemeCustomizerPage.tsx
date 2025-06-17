/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowLeft, Palette, Loader2 } from 'lucide-react';
import { useSellerThemeWithSWR } from '@/hooks/useSellerThemeWithSWR';
import { useSellerAuth } from '@/context/SellerAuthContext';
import ThemeCustomizer from '@/components/Private/seller/profile/ThemeCustomizer';
import type { ThemeType } from '@/types';

interface ThemeCustomizerPageProps {
  seller: any;
  onBack: () => void;
}

export function ThemeCustomizerPage({ seller, onBack }: ThemeCustomizerPageProps) {
  const { login } = useSellerAuth();
  const { theme: currentTheme, loading: isLoadingTheme, updateTheme } = useSellerThemeWithSWR();

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
    <div className="space-y-5 px-5 lg:px-0 max-w-screen-lg min-h-[75vh]">
      {/* Header */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label="Back to overview">
            <ArrowLeft className="w-4 h-4 text-light-400" />
          </button>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-medium text-white">Theme Customizer</h1>
          </div>
        </div>
        <p className="text-xs text-light-400 mt-2 ml-12">
          Customize your store's appearance and branding
        </p>
      </div>

      {/* Content */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        {isLoadingTheme ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-xs text-light-400">Loading theme...</span>
          </div>
        ) : currentTheme ? (
          <ThemeCustomizer
            seller={seller}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        ) : (
          <div className="flex items-center justify-center py-12">
            <span className="text-xs text-light-400">No theme data available</span>
          </div>
        )}
      </div>
    </div>
  );
}
