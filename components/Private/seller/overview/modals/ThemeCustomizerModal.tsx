/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { X, Palette, Loader2 } from 'lucide-react';
import { useSellerThemeWithSWR } from '@/hooks/useSellerThemeWithSWR';
import { useSellerAuth } from '@/context/SellerAuthContext';
import ThemeCustomizer from '@/components/Private/seller/profile/ThemeCustomizer';
import type { ThemeType } from '@/types';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: any;
}

export function ThemeCustomizerModal({ isOpen, onClose, seller }: ThemeCustomizerModalProps) {
  const { login } = useSellerAuth();
  const {
    theme: currentTheme,
    loading: isLoadingTheme,
    error: themeError,
    updateTheme,
  } = useSellerThemeWithSWR();

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4 animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      <div
        className="bg-dark-800 border border-dark-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-600">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-white">Theme Customizer</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-lg transition-colors">
            <X className="w-4 h-4 text-light-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
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
    </div>
  );
}
