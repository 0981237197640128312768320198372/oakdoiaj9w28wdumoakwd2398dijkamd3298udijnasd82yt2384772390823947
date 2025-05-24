/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Palette,
  Circle,
  Square,
  ImageIcon,
  Save,
  Loader2,
  Sun,
  Moon,
  CreditCard,
} from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ColorGrid } from '@/components/ui/ColorGrid';

interface ThemeCustomizerProps {
  seller: any;
  onThemeChange: (theme: any) => void;
}

export default function ThemeCustomizer({ seller, onThemeChange }: ThemeCustomizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [theme, setTheme] = useState({
    baseTheme: seller?.store?.theme?.baseTheme || 'dark',
    customizations: {
      colors: {
        primary: seller?.store?.theme?.customizations?.colors?.primary || '#B9FE13',
        secondary: seller?.store?.theme?.customizations?.colors?.secondary || '#0F0F0F',
      },
      button: {
        textColor: seller?.store?.theme?.customizations?.button?.textColor || '#0F0F0F',
        backgroundColor: seller?.store?.theme?.customizations?.button?.backgroundColor || '#B9FE13',
        roundedness: seller?.store?.theme?.customizations?.button?.roundedness || 'md',
        shadow: seller?.store?.theme?.customizations?.button?.shadow || 'sm',
        border: seller?.store?.theme?.customizations?.button?.border || 'none',
        borderColor: seller?.store?.theme?.customizations?.button?.borderColor || '#B9FE13',
      },
      componentStyles: {
        cardRoundedness:
          seller?.store?.theme?.customizations?.componentStyles?.cardRoundedness || 'md',
        cardShadow: seller?.store?.theme?.customizations?.componentStyles?.cardShadow || 'sm',
      },
      ads: {
        imageUrl: seller?.store?.theme?.customizations?.ads?.imageUrl || null,
        roundedness: seller?.store?.theme?.customizations?.ads?.roundedness || 'md',
        shadow: seller?.store?.theme?.customizations?.ads?.shadow || 'sm',
      },
    },
  });

  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [adsImage, setAdsImage] = useState<File | null>(null);

  useEffect(() => {
    if (seller?.store?.theme) {
      setTheme({
        baseTheme: seller.store.theme.baseTheme || 'dark',
        customizations: {
          colors: {
            primary: seller.store.theme.customizations?.colors?.primary || '#B9FE13',
            secondary: seller.store.theme.customizations?.colors?.secondary || '#0F0F0F',
          },
          button: {
            textColor: seller.store.theme.customizations?.button?.textColor || '#0F0F0F',
            backgroundColor:
              seller.store.theme.customizations?.button?.backgroundColor || '#B9FE13',
            roundedness: seller.store.theme.customizations?.button?.roundedness || 'md',
            shadow: seller.store.theme.customizations?.button?.shadow || 'sm',
            border: seller.store.theme.customizations?.button?.border || 'none',
            borderColor: seller.store.theme.customizations?.button?.borderColor || '#B9FE13',
          },
          componentStyles: {
            cardRoundedness:
              seller.store.theme.customizations?.componentStyles?.cardRoundedness || 'md',
            cardShadow: seller.store.theme.customizations?.componentStyles?.cardShadow || 'sm',
          },
          ads: {
            imageUrl: seller.store.theme.customizations?.ads?.imageUrl || null,
            roundedness: seller.store.theme.customizations?.ads?.roundedness || 'md',
            shadow: seller.store.theme.customizations?.ads?.shadow || 'sm',
          },
        },
      });
    }
  }, [seller]);

  const handleBaseThemeChange = (value: 'light' | 'dark') => {
    setTheme((prev) => ({
      ...prev,
      baseTheme: value,
    }));
  };

  const handleChange = (section: string, subsection: string | null, key: string, value: string) => {
    setTheme((prev) => {
      if (section === 'colors') {
        return {
          ...prev,
          customizations: {
            ...prev.customizations,
            colors: {
              ...prev.customizations.colors,
              [key]: value,
            },
          },
        };
      } else if (section === 'button') {
        return {
          ...prev,
          customizations: {
            ...prev.customizations,
            button: {
              ...prev.customizations.button,
              [key]: value,
            },
          },
        };
      } else if (section === 'componentStyles') {
        return {
          ...prev,
          customizations: {
            ...prev.customizations,
            componentStyles: {
              ...prev.customizations.componentStyles,
              [key]: value,
            },
          },
        };
      } else if (section === 'ads') {
        return {
          ...prev,
          customizations: {
            ...prev.customizations,
            ads: {
              ...prev.customizations.ads,
              [key]: value,
            },
          },
        };
      } else {
        return prev;
      }
    });
  };

  const handleAdsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdsImage(file);
      // In a real implementation, you would upload this file to your server
      // and get back a URL to store in the theme
      const reader = new FileReader();
      reader.onloadend = () => {
        setTheme((prev) => ({
          ...prev,
          customizations: {
            ...prev.customizations,
            ads: {
              ...prev.customizations.ads,
              imageUrl: reader.result as string,
            },
          },
        }));
      };
      reader.readAsDataURL(file);
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

  // Get the appropriate shadow class based on the shadow value
  const getShadowClass = (shadow: string) => {
    switch (shadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-none';
    }
  };

  // Get the appropriate roundedness class based on the roundedness value
  const getRoundednessClass = (roundedness: string) => {
    switch (roundedness) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      case 'full':
        return 'rounded-full';
      default:
        return 'rounded-md';
    }
  };

  // Get the appropriate border class based on the border value
  const getBorderClass = (border: string) => {
    switch (border) {
      case 'none':
        return 'border-0';
      case 'sm':
        return 'border';
      case 'md':
        return 'border-2';
      case 'lg':
        return 'border-4';
      default:
        return 'border-0';
    }
  };

  // Preview component to show theme changes in real-time
  const ThemePreview = () => {
    const bgColor = theme.baseTheme === 'dark' ? '#171717' : '#f9fafb';
    const textColor = theme.baseTheme === 'dark' ? '#f3f4f6' : '#1f2937';
    const cardBgColor = theme.baseTheme === 'dark' ? '#262626' : '#ffffff';
    const cardBorderColor = theme.baseTheme === 'dark' ? '#404040' : '#e5e7eb';

    return (
      <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
        <h3 className="text-light-200 text-sm font-medium mb-3">Live Preview</h3>
        <div
          className="p-6 rounded-lg relative overflow-hidden"
          style={{ backgroundColor: bgColor }}>
          <div className="relative z-10">
            <h4
              className="text-lg font-medium mb-4"
              style={{
                color: textColor,
              }}>
              Sample Store
            </h4>

            {/* Sample Card */}
            <div
              className={`p-4 mb-4 ${getRoundednessClass(
                theme.customizations.componentStyles.cardRoundedness
              )} ${getShadowClass(theme.customizations.componentStyles.cardShadow)} border`}
              style={{
                backgroundColor: cardBgColor,
                borderColor: cardBorderColor,
              }}>
              <h5 style={{ color: textColor }} className="text-base font-medium mb-2">
                Product Card
              </h5>
              <p style={{ color: textColor }} className="text-sm mb-3 opacity-80">
                This is how your product cards will appear.
              </p>
              <div className="flex justify-between items-center">
                <span
                  style={{ color: theme.customizations.colors.primary }}
                  className="font-medium">
                  $99.99
                </span>
                <button
                  className={`px-3 py-1 ${getRoundednessClass(
                    theme.customizations.button.roundedness
                  )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                    theme.customizations.button.border
                  )}`}
                  style={{
                    backgroundColor: theme.customizations.button.backgroundColor,
                    color: theme.customizations.button.textColor,
                    borderColor: theme.customizations.button.borderColor,
                  }}>
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Sample Ads Banner */}
            {theme.customizations.ads.imageUrl ? (
              <div
                className={`relative h-24 w-full overflow-hidden mb-4 ${getRoundednessClass(
                  theme.customizations.ads.roundedness
                )} ${getShadowClass(theme.customizations.ads.shadow)}`}>
                <Image
                  src={theme.customizations.ads.imageUrl || '/placeholder.svg'}
                  alt="Advertisement"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className={`h-24 w-full mb-4 flex items-center justify-center ${getRoundednessClass(
                  theme.customizations.ads.roundedness
                )} ${getShadowClass(theme.customizations.ads.shadow)}`}
                style={{
                  backgroundColor: theme.customizations.colors.primary,
                  color: theme.customizations.button.textColor,
                }}>
                <span className="font-medium">Advertisement Banner</span>
              </div>
            )}

            {/* Sample Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-4 py-2 ${getRoundednessClass(
                  theme.customizations.button.roundedness
                )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                  theme.customizations.button.border
                )}`}
                style={{
                  backgroundColor: theme.customizations.button.backgroundColor,
                  color: theme.customizations.button.textColor,
                  borderColor: theme.customizations.button.borderColor,
                }}>
                Primary Button
              </button>
              <button
                className={`px-4 py-2 ${getRoundednessClass(
                  theme.customizations.button.roundedness
                )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                  theme.customizations.button.border
                )} bg-transparent`}
                style={{
                  borderColor: theme.customizations.colors.primary,
                  color: theme.customizations.colors.primary,
                }}>
                Outline Button
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ThemePreview />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-dark-700 border border-dark-600">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            General
          </TabsTrigger>
          <TabsTrigger
            value="colors"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            Colors
          </TabsTrigger>
          <TabsTrigger
            value="buttons"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            Buttons
          </TabsTrigger>
          <TabsTrigger
            value="components"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary-500">
            Components
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Circle className="w-4 h-4 text-primary-500" />
                <h3 className="text-light-100 font-medium">Base Theme</h3>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <Label htmlFor="theme-mode" className="text-light-200">
                      Light Mode
                    </Label>
                  </div>
                  <Switch
                    id="theme-mode"
                    checked={theme.baseTheme === 'dark'}
                    onCheckedChange={(checked: any) =>
                      handleBaseThemeChange(checked ? 'dark' : 'light')
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor="theme-mode" className="text-light-200">
                      Dark Mode
                    </Label>
                    <Moon className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      theme.baseTheme === 'light' ? 'ring-2 ring-primary-500' : ''
                    }`}
                    style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                    <div className="text-center text-gray-800 font-medium">Light Theme</div>
                    <div className="mt-2 p-2 rounded bg-white border border-gray-200">
                      <div className="h-2 w-16 bg-gray-300 rounded mb-1"></div>
                      <div className="h-2 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg border ${
                      theme.baseTheme === 'dark' ? 'ring-2 ring-primary-500' : ''
                    }`}
                    style={{ backgroundColor: '#171717', borderColor: '#404040' }}>
                    <div className="text-center text-gray-200 font-medium">Dark Theme</div>
                    <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-700">
                      <div className="h-2 w-16 bg-neutral-600 rounded mb-1"></div>
                      <div className="h-2 w-12 bg-neutral-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-primary-500" />
                <h3 className="text-light-100 font-medium">Ads Banner</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-light-300">Roundedness</label>
                  <Select
                    value={theme.customizations.ads.roundedness}
                    onValueChange={(value) => handleChange('ads', null, 'roundedness', value)}>
                    <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                      <SelectValue placeholder="Select roundedness" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-700 border-dark-600">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-light-300">Shadow</label>
                  <Select
                    value={theme.customizations.ads.shadow}
                    onValueChange={(value) => handleChange('ads', null, 'shadow', value)}>
                    <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                      <SelectValue placeholder="Select shadow" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-700 border-dark-600">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-light-300">Ads Banner Image</label>
                  <div className="flex flex-col gap-2">
                    <div className="relative group">
                      <div className="w-full h-32 bg-dark-700 border border-dark-600 rounded-lg overflow-hidden flex items-center justify-center">
                        {theme.customizations.ads.imageUrl ? (
                          <Image
                            src={theme.customizations.ads.imageUrl || '/placeholder.svg'}
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
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary-500" />
                <h3 className="text-light-100 font-medium">Brand Colors</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-medium text-light-300">Primary Color</label>
                  <ColorGrid
                    value={theme.customizations.colors.primary}
                    onChange={(value) => handleChange('colors', null, 'primary', value)}
                    colorType="primary"
                  />
                  <p className="text-xs text-light-500">
                    Used for accents, buttons, and highlights
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-medium text-light-300">Secondary Color</label>
                  <ColorGrid
                    value={theme.customizations.colors.secondary}
                    onChange={(value) => handleChange('colors', null, 'secondary', value)}
                    colorType="secondary"
                  />
                  <p className="text-xs text-light-500">
                    Used for backgrounds and secondary elements
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="buttons" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Square className="w-4 h-4 text-primary-500" />
                <h3 className="text-light-100 font-medium">Button Styles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Roundedness</label>
                    <Select
                      value={theme.customizations.button.roundedness}
                      onValueChange={(value) => handleChange('button', null, 'roundedness', value)}>
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                        <SelectValue placeholder="Select roundedness" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Border</label>
                    <Select
                      value={theme.customizations.button.border}
                      onValueChange={(value) => handleChange('button', null, 'border', value)}>
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                        <SelectValue placeholder="Select border style" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Shadow</label>
                    <Select
                      value={theme.customizations.button.shadow}
                      onValueChange={(value) => handleChange('button', null, 'shadow', value)}>
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                        <SelectValue placeholder="Select shadow" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Button Text Color</label>
                    <ColorGrid
                      value={theme.customizations.button.textColor}
                      onChange={(value) => handleChange('button', null, 'textColor', value)}
                      colorType="text"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">
                      Button Background Color
                    </label>
                    <ColorGrid
                      value={theme.customizations.button.backgroundColor}
                      onChange={(value) => handleChange('button', null, 'backgroundColor', value)}
                      colorType="button"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">
                      Button Border Color
                    </label>
                    <ColorGrid
                      value={theme.customizations.button.borderColor}
                      onChange={(value) => handleChange('button', null, 'borderColor', value)}
                      colorType="border"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-dark-600 rounded-lg bg-dark-700">
                <h4 className="text-sm font-medium text-light-200 mb-3">Button Preview</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    className={`px-4 py-2 ${getRoundednessClass(
                      theme.customizations.button.roundedness
                    )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                      theme.customizations.button.border
                    )}`}
                    style={{
                      backgroundColor: theme.customizations.button.backgroundColor,
                      color: theme.customizations.button.textColor,
                      borderColor: theme.customizations.button.borderColor,
                    }}>
                    Primary Button
                  </button>
                  <button
                    className={`px-4 py-2 ${getRoundednessClass(
                      theme.customizations.button.roundedness
                    )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                      theme.customizations.button.border
                    )} bg-transparent`}
                    style={{
                      borderColor: theme.customizations.button.borderColor,
                      color: theme.customizations.colors.primary,
                    }}>
                    Outline Button
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary-500" />
                <h3 className="text-light-100 font-medium">Card Styles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Card Roundedness</label>
                    <Select
                      value={theme.customizations.componentStyles.cardRoundedness}
                      onValueChange={(value) =>
                        handleChange('componentStyles', null, 'cardRoundedness', value)
                      }>
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                        <SelectValue placeholder="Select roundedness" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">Card Shadow</label>
                    <Select
                      value={theme.customizations.componentStyles.cardShadow}
                      onValueChange={(value) =>
                        handleChange('componentStyles', null, 'cardShadow', value)
                      }>
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-light-200">
                        <SelectValue placeholder="Select shadow" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sm">Small</SelectItem>
                        <SelectItem value="md">Medium</SelectItem>
                        <SelectItem value="lg">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 border border-dark-600 rounded-lg bg-dark-700">
                <h4 className="text-sm font-medium text-light-200 mb-3">Card Preview</h4>
                <div
                  className={`p-4 ${getRoundednessClass(
                    theme.customizations.componentStyles.cardRoundedness
                  )} ${getShadowClass(
                    theme.customizations.componentStyles.cardShadow
                  )} border border-dark-500 bg-dark-600`}>
                  <h5 className="text-light-100 font-medium mb-2">Sample Card</h5>
                  <p className="text-light-300 text-sm mb-3">
                    This is how your cards will appear in your store.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-500 font-medium">$99.99</span>
                    <button
                      className={`px-3 py-1 ${getRoundednessClass(
                        theme.customizations.button.roundedness
                      )} ${getShadowClass(theme.customizations.button.shadow)} ${getBorderClass(
                        theme.customizations.button.border
                      )}`}
                      style={{
                        backgroundColor: theme.customizations.button.backgroundColor,
                        color: theme.customizations.button.textColor,
                        borderColor: theme.customizations.button.borderColor,
                      }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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
