/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
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
import { cn } from '@/lib/utils';
import { AdsBannerUploader } from './AdsBannerUploader';
import { ColorGrid } from './ColorGrid';

const THEME_STORAGE_KEY = 'theme-customizer-draft';

interface ThemeCustomizerProps {
  seller: any;
  currentTheme: any; // The current theme data passed from parent
  onThemeChange: (theme: any) => void;
}

export default function ThemeCustomizer({
  seller,
  currentTheme,
  onThemeChange,
}: ThemeCustomizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the passed currentTheme as the base theme
  const [baseTheme, setBaseTheme] = useState(
    () =>
      currentTheme || {
        baseTheme: 'dark',
        customizations: {
          colors: { primary: 'primary', secondary: 'dark-800' },
          button: {
            textColor: 'dark-800',
            backgroundColor: 'primary',
            roundedness: 'md',
            shadow: 'sm',
            border: 'none',
            borderColor: 'primary',
          },
          componentStyles: { cardRoundedness: 'md', cardShadow: 'sm' },
          ads: { images: [], roundedness: 'md', shadow: 'sm' },
        },
      }
  );

  const [theme, setTheme] = useState(() => currentTheme || baseTheme);

  // Update base theme when currentTheme prop changes
  useEffect(() => {
    if (currentTheme) {
      setBaseTheme(currentTheme);

      // Check if there's a draft in localStorage
      const savedDraft = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedDraft && !isInitialized) {
        try {
          const draftTheme = JSON.parse(savedDraft);
          // Deep merge draft with current theme
          const mergedTheme = {
            ...currentTheme,
            baseTheme: draftTheme.baseTheme || currentTheme.baseTheme,
            customizations: {
              colors: {
                ...currentTheme.customizations.colors,
                ...draftTheme.customizations?.colors,
              },
              button: {
                ...currentTheme.customizations.button,
                ...draftTheme.customizations?.button,
              },
              componentStyles: {
                ...currentTheme.customizations.componentStyles,
                ...draftTheme.customizations?.componentStyles,
              },
              ads: {
                ...currentTheme.customizations.ads,
                ...draftTheme.customizations?.ads,
              },
            },
          };
          setTheme(mergedTheme);
          setHasUnsavedChanges(true);
        } catch (e) {
          console.error('Failed to parse saved theme:', e);
          setTheme(currentTheme);
        }
      } else {
        setTheme(currentTheme);
      }

      setIsInitialized(true);
    }
  }, [currentTheme, isInitialized]);

  // Save theme to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized && currentTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));

      // Check if current theme is different from base theme
      const isDifferent = JSON.stringify(theme) !== JSON.stringify(baseTheme);
      setHasUnsavedChanges(isDifferent);
    }
  }, [theme, baseTheme, isInitialized, currentTheme]);

  const handleBaseThemeChange = (value: 'light' | 'dark') => {
    setTheme((prev: any) => ({
      ...prev,
      baseTheme: value,
    }));
  };

  const handleChange = (section: string, subsection: string | null, key: string, value: string) => {
    setTheme(
      (prev: { customizations: { colors: any; button: any; componentStyles: any; ads: any } }) => {
        const newTheme = { ...prev };

        if (section === 'colors') {
          newTheme.customizations = {
            ...prev.customizations,
            colors: {
              ...prev.customizations.colors,
              [key]: value,
            },
          };
        } else if (section === 'button') {
          newTheme.customizations = {
            ...prev.customizations,
            button: {
              ...prev.customizations.button,
              [key]: value,
            },
          };
        } else if (section === 'componentStyles') {
          newTheme.customizations = {
            ...prev.customizations,
            componentStyles: {
              ...prev.customizations.componentStyles,
              [key]: value,
            },
          };
        } else if (section === 'ads') {
          newTheme.customizations = {
            ...prev.customizations,
            ads: {
              ...prev.customizations.ads,
              [key]: value,
            },
          };
        }

        return newTheme;
      }
    );
  };

  const handleAdsImagesChange = (urls: string[]) => {
    setTheme((prev: { customizations: { ads: any } }) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        ads: {
          ...prev.customizations.ads,
          images: urls,
        },
      },
    }));
  };

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      await onThemeChange(theme);
      // Clear the draft from localStorage after successful save
      localStorage.removeItem(THEME_STORAGE_KEY);
      setHasUnsavedChanges(false);
      // Update base theme to current theme
      setBaseTheme(theme);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChanges = () => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    setTheme(baseTheme);
    setHasUnsavedChanges(false);
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

  // Build color classes
  const buildColorClass = (color: string, type: 'bg' | 'text' | 'border') => {
    if (color === 'primary') {
      return type === 'bg' ? 'bg-primary' : type === 'text' ? 'text-primary' : 'border-primary';
    }
    return `${type}-${color}`;
  };

  // Color Preview Component
  const ColorPreview = () => {
    return (
      <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
        <h3 className="text-light-200 text-sm font-medium mb-3">Color Preview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center space-y-2">
            <div
              className={cn(
                'w-full h-20 rounded-md',
                buildColorClass(theme.customizations.colors.primary, 'bg')
              )}
            />
            <span className="text-light-300 text-xs">Primary Color</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div
              className={cn(
                'w-full h-20 rounded-md',
                buildColorClass(theme.customizations.colors.secondary, 'bg')
              )}
            />
            <span className="text-light-300 text-xs">Secondary Color</span>
          </div>
        </div>
      </div>
    );
  };

  // Button Preview Component
  const ButtonPreview = () => {
    return (
      <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
        <h3 className="text-light-200 text-sm font-medium mb-3">Button Preview</h3>
        <div className="flex flex-wrap gap-4 p-4 bg-dark-800 rounded-md">
          <button
            className={cn(
              'px-4 py-2',
              getRoundednessClass(theme.customizations.button.roundedness),
              getShadowClass(theme.customizations.button.shadow),
              getBorderClass(theme.customizations.button.border),
              buildColorClass(theme.customizations.button.backgroundColor, 'bg'),
              buildColorClass(theme.customizations.button.textColor, 'text'),
              buildColorClass(theme.customizations.button.borderColor, 'border')
            )}>
            Primary Button
          </button>
          <button
            className={cn(
              'px-4 py-2 bg-transparent',
              getRoundednessClass(theme.customizations.button.roundedness),
              getShadowClass(theme.customizations.button.shadow),
              getBorderClass(theme.customizations.button.border),
              buildColorClass(theme.customizations.colors.primary, 'text'),
              buildColorClass(theme.customizations.button.borderColor, 'border')
            )}>
            Outline Button
          </button>
        </div>
      </div>
    );
  };

  // Card Preview Component
  const CardPreview = () => {
    return (
      <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
        <h3 className="text-light-200 text-sm font-medium mb-3">Card Preview</h3>
        <div
          className={cn(
            'p-4 border border-dark-500 bg-dark-600',
            getRoundednessClass(theme.customizations.componentStyles.cardRoundedness),
            getShadowClass(theme.customizations.componentStyles.cardShadow)
          )}>
          <h5 className="text-light-100 font-medium mb-2">Sample Card</h5>
          <p className="text-light-300 text-sm mb-3">
            This is how your cards will appear in your store.
          </p>
          <div className="flex justify-between items-center">
            <span
              className={cn(
                'font-medium',
                buildColorClass(theme.customizations.colors.primary, 'text')
              )}>
              $99.99
            </span>
            <button
              className={cn(
                'px-3 py-1',
                getRoundednessClass(theme.customizations.button.roundedness),
                getShadowClass(theme.customizations.button.shadow),
                getBorderClass(theme.customizations.button.border),
                buildColorClass(theme.customizations.button.backgroundColor, 'bg'),
                buildColorClass(theme.customizations.button.textColor, 'text'),
                buildColorClass(theme.customizations.button.borderColor, 'border')
              )}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Ads Banner Preview
  const AdsBannerPreview = () => {
    const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

    return (
      <div className="p-4 border border-dark-600 rounded-lg bg-dark-700 mb-6">
        <h3 className="text-light-200 text-sm font-medium mb-3">Ads Banner Preview</h3>
        {theme.customizations.ads.images && theme.customizations.ads.images.length > 0 ? (
          <div className="relative">
            <div
              className={cn(
                'relative h-32 w-full overflow-hidden',
                getRoundednessClass(theme.customizations.ads.roundedness),
                getShadowClass(theme.customizations.ads.shadow)
              )}>
              <Image
                src={theme.customizations.ads.images[currentPreviewIndex] || '/placeholder.svg'}
                alt="Advertisement"
                fill
                className="object-cover"
              />
            </div>
            {theme.customizations.ads.images.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {theme.customizations.ads.images.map((_: any, index: any) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPreviewIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      currentPreviewIndex === index ? 'bg-primary w-4' : 'bg-dark-500'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'h-32 w-full flex items-center justify-center',
              getRoundednessClass(theme.customizations.ads.roundedness),
              getShadowClass(theme.customizations.ads.shadow),
              buildColorClass(theme.customizations.colors.primary, 'bg'),
              buildColorClass(theme.customizations.button.textColor, 'text')
            )}>
            <span className="font-medium">Advertisement Banner</span>
          </div>
        )}
      </div>
    );
  };

  if (!isInitialized || !currentTheme) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-light-400">Initializing theme customizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-dark-700 border border-dark-600">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary">
            General
          </TabsTrigger>
          <TabsTrigger
            value="colors"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary">
            Colors
          </TabsTrigger>
          <TabsTrigger
            value="buttons"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary">
            Buttons
          </TabsTrigger>
          <TabsTrigger
            value="components"
            className="data-[state=active]:bg-dark-600 data-[state=active]:text-primary">
            Components
          </TabsTrigger>
        </TabsList>

        {hasUnsavedChanges && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-500">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
            <p className="text-xs text-amber-400 mt-1">
              Your changes are automatically saved as draft. Click "Save Theme" to apply them
              permanently.
            </p>
          </div>
        )}

        <TabsContent value="general" className="mt-0 space-y-6">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Circle className="w-4 h-4 text-primary" />
                <h3 className="text-light-100 font-medium">Base Theme</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                    'bg-gray-50 border-gray-200 hover:border-primary/70',
                    theme.baseTheme === 'light' && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleBaseThemeChange('light')}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h4 className="text-gray-800 font-medium">Light Mode</h4>
                  </div>
                  <div className="mt-2 p-2 rounded bg-white border border-gray-200">
                    <div className="h-2 w-16 bg-gray-300 rounded mb-1"></div>
                    <div className="h-2 w-12 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                    'bg-neutral-900 border-neutral-700 hover:border-primary/70',
                    theme.baseTheme === 'dark' && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleBaseThemeChange('dark')}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-gray-200 font-medium">Dark Mode</h4>
                  </div>
                  <div className="mt-2 p-2 rounded bg-neutral-800 border border-neutral-700">
                    <div className="h-2 w-16 bg-neutral-600 rounded mb-1"></div>
                    <div className="h-2 w-12 bg-neutral-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-primary" />
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
                  <label className="text-xs font-medium text-light-300">Ads Banner Images</label>
                  <AdsBannerUploader
                    images={theme.customizations.ads.images || []}
                    onImagesChange={handleAdsImagesChange}
                    maxImages={5}
                  />
                </div>
              </div>
            </div>
          </Card>

          <AdsBannerPreview />
        </TabsContent>

        <TabsContent value="colors" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-light-100 font-medium">Brand Colors</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <label className="text-xs font-medium text-light-300">Primary Color</label>
                  <ColorGrid
                    value={theme.customizations.colors.primary}
                    onChange={(value) => handleChange('colors', null, 'primary', value)}
                    label="Primary"
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
                    label="Secondary"
                  />
                  <p className="text-xs text-light-500">
                    Used for backgrounds and secondary elements
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <ColorPreview />
        </TabsContent>

        <TabsContent value="buttons" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Square className="w-4 h-4 text-primary" />
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
                      label="Text"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">
                      Button Background Color
                    </label>
                    <ColorGrid
                      value={theme.customizations.button.backgroundColor}
                      onChange={(value) => handleChange('button', null, 'backgroundColor', value)}
                      label="Background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-300">
                      Button Border Color
                    </label>
                    <ColorGrid
                      value={theme.customizations.button.borderColor}
                      onChange={(value) => handleChange('button', null, 'borderColor', value)}
                      label="Border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <ButtonPreview />
        </TabsContent>

        <TabsContent value="components" className="mt-0">
          <Card className="bg-dark-800 border border-dark-600 p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary" />
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
            </div>
          </Card>

          <CardPreview />
        </TabsContent>
      </Tabs>

      <div className="pt-4 flex justify-end gap-2">
        <Button2
          onClick={handleResetChanges}
          variant="outline"
          className="border-dark-600 text-light-300 hover:bg-dark-700"
          disabled={!hasUnsavedChanges}>
          Reset Changes
        </Button2>
        <Button2
          onClick={handleSaveTheme}
          disabled={isLoading || !hasUnsavedChanges}
          className="bg-primary hover:bg-primary/90 text-dark-800 font-medium">
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
