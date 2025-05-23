/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import type React from 'react';
import { useState, useEffect } from 'react';
import { Palette, Circle, Square, ImageIcon, Save, Loader2 } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ThemeCustomizerProps {
  seller: any;
  onThemeChange: (theme: any) => void;
}

export default function ThemeCustomizer({ seller, onThemeChange }: ThemeCustomizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState({
    roundedness: seller?.store?.theme?.roundedness || 'rounded',
    primaryColor: seller?.store?.theme?.primaryColor || '#B9FE13',
    secondaryColor: seller?.store?.theme?.secondaryColor || '#0F0F0F',
    textColor: seller?.store?.theme?.textColor || '#ECECEC',
    fontFamily: seller?.store?.theme?.fontFamily || 'AktivGrotesk-Regular',
    backgroundImage: seller?.store?.theme?.backgroundImage || null,
    buttonTextColor: seller?.store?.theme?.buttonTextColor || '#0F0F0F',
    buttonBgColor: seller?.store?.theme?.buttonBgColor || '#B9FE13',
    buttonBorder: seller?.store?.theme?.buttonBorder || 'border-none',
    spacing: seller?.store?.theme?.spacing || 'normal',
    shadow: seller?.store?.theme?.shadow || 'shadow-none',
    adsImageUrl: seller?.store?.adsImageUrl || null,
  });

  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [adsImage, setAdsImage] = useState<File | null>(null);

  useEffect(() => {
    if (seller?.store?.theme) {
      setTheme({
        roundedness: seller.store.theme.roundedness || 'rounded',
        primaryColor: seller.store.theme.primaryColor || '#B9FE13',
        secondaryColor: seller.store.theme.secondaryColor || '#0F0F0F',
        textColor: seller.store.theme.textColor || '#ECECEC',
        fontFamily: seller.store.theme.fontFamily || 'AktivGrotesk-Regular',
        backgroundImage: seller.store.theme.backgroundImage || null,
        buttonTextColor: seller.store.theme.buttonTextColor || '#0F0F0F',
        buttonBgColor: seller.store.theme.buttonBgColor || '#B9FE13',
        buttonBorder: seller.store.theme.buttonBorder || 'border-none',
        spacing: seller.store.theme.spacing || 'normal',
        shadow: seller.store.theme.shadow || 'shadow-none',
        adsImageUrl: seller.store.adsImageUrl || null,
      });
    }
  }, [seller]);

  const handleChange = (key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      // Preview could be added here if needed
    }
  };

  const handleAdsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdsImage(file);
      // Preview could be added here if needed
    }
  };

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      await onThemeChange(theme);
    } finally {
      setIsLoading(false);
    }
  };

  const fontOptions = ['AktivGrotesk-Regular', 'AktivGrotesk-Bold', 'AktivGrotesk-Medium'];
  const spacingOptions = ['normal', 'tight', 'wide'];
  const shadowOptions = ['shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg'];
  const borderOptions = ['border-none', 'border', 'border-2'];

  // Preview component to show theme changes in real-time
  const ThemePreview = () => (
    <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
      <h3 className="text-light-200 text-sm font-medium mb-3">Live Preview</h3>
      <div
        className="p-4 rounded-lg relative overflow-hidden"
        style={{ backgroundColor: theme.secondaryColor }}>
        {theme.backgroundImage && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={theme.backgroundImage || '/placeholder.svg'}
              alt="Background"
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="relative z-10">
          <h4
            className="text-lg font-medium mb-2"
            style={{
              color: theme.textColor,
              fontFamily: theme.fontFamily,
            }}>
            Sample Store
          </h4>
          <p
            className="text-sm mb-4 opacity-80"
            style={{
              color: theme.textColor,
              fontFamily: theme.fontFamily,
            }}>
            This is how your store will look with the current theme settings.
          </p>
          <button
            className={`px-4 py-2 ${theme.roundedness} ${theme.buttonBorder} ${theme.shadow}`}
            style={{
              backgroundColor: theme.buttonBgColor,
              color: theme.buttonTextColor,
              fontFamily: theme.fontFamily,
            }}>
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ThemePreview />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Layout Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-4 h-4 text-primary-500" />
            <h3 className="text-light-100 font-medium">Layout & Style</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Roundedness</label>
              <Select
                value={theme.roundedness}
                onValueChange={(value) => handleChange('roundedness', value)}>
                <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                  <SelectValue placeholder="Select roundedness" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="rounded-full">Rounded Full</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Spacing</label>
              <Select
                value={theme.spacing}
                onValueChange={(value) => handleChange('spacing', value)}>
                <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  {spacingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Shadow</label>
              <Select value={theme.shadow} onValueChange={(value) => handleChange('shadow', value)}>
                <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                  <SelectValue placeholder="Select shadow" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  {shadowOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Font Family</label>
              <Select
                value={theme.fontFamily}
                onValueChange={(value) => handleChange('fontFamily', value)}>
                <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  {fontOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-primary-500" />
            <h3 className="text-light-100 font-medium">Colors</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded bg-dark-700 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded p-2 text-light-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-10 h-10 rounded bg-dark-700 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded p-2 text-light-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="w-10 h-10 rounded bg-dark-700 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.textColor}
                  onChange={(e) => handleChange('textColor', e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded p-2 text-light-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-dark-600" />

      {/* Button Styles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Square className="w-4 h-4 text-primary-500" />
          <h3 className="text-light-100 font-medium">Button Styles</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Button Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.buttonTextColor}
                  onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                  className="w-10 h-10 rounded bg-dark-700 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.buttonTextColor}
                  onChange={(e) => handleChange('buttonTextColor', e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded p-2 text-light-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Button Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.buttonBgColor}
                  onChange={(e) => handleChange('buttonBgColor', e.target.value)}
                  className="w-10 h-10 rounded bg-dark-700 border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.buttonBgColor}
                  onChange={(e) => handleChange('buttonBgColor', e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded p-2 text-light-200 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-light-300">Button Border</label>
              <Select
                value={theme.buttonBorder}
                onValueChange={(value) => handleChange('buttonBorder', value)}>
                <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                  <SelectValue placeholder="Select border style" />
                </SelectTrigger>
                <SelectContent className="bg-dark-700 border-dark-600">
                  {borderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-dark-600" />

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-4 h-4 text-primary-500" />
          <h3 className="text-light-100 font-medium">Images</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-xs font-medium text-light-300">Background Image</label>
            <div className="flex flex-col gap-2">
              <div className="relative group">
                <div className="w-full h-32 bg-dark-700 border border-dark-600 rounded-lg overflow-hidden flex items-center justify-center">
                  {theme.backgroundImage ? (
                    <Image
                      src={theme.backgroundImage || '/placeholder.svg'}
                      alt="Background"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <p className="text-light-500 text-sm">No background image</p>
                  )}
                  <div className="absolute inset-0 bg-dark-800/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-light-200 text-xs">Click to change</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-light-500">Recommended size: 1920x1080px</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-light-300">Ads Image</label>
            <div className="flex flex-col gap-2">
              <div className="relative group">
                <div className="w-full h-32 bg-dark-700 border border-dark-600 rounded-lg overflow-hidden flex items-center justify-center">
                  {theme.adsImageUrl ? (
                    <Image
                      src={theme.adsImageUrl || '/placeholder.svg'}
                      alt="Ads"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <p className="text-light-500 text-sm">No ads image</p>
                  )}
                  <div className="absolute inset-0 bg-dark-800/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <p className="text-light-200 text-xs">Click to change</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdsImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-light-500">Recommended size: 1200x628px</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button2
          onClick={handleSaveTheme}
          disabled={isLoading}
          className="bg-primary-500 hover:bg-primary-600 text-dark-800 font-medium">
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Theme
            </>
          )}
        </Button2>
      </div>
    </div>
  );
}
