/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import {
  Palette,
  Circle,
  ImageIcon,
  Save,
  Loader2,
  Sun,
  Moon,
  CreditCard,
  RotateCcw,
  EyeIcon,
  HelpCircle,
  Info,
  Layers,
  Layout,
} from 'lucide-react';
import { Button2 } from '@/components/ui/button2';
import { MdOutlineSmartButton } from 'react-icons/md';
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
import type { ThemeType } from '@/types';
import { useThemeUtils } from '@/lib/theme-utils';
import LivePreview from './LivePreview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const THEME_STORAGE_KEY = 'theme-customizer-draft';

interface ThemeCustomizerProps {
  seller: any;
  currentTheme: ThemeType | null;
  onThemeChange: (theme: ThemeType) => void;
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
  const getDefaultTheme = (): ThemeType => ({
    sellerId: seller?.id || '',
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

  const [baseTheme, setBaseTheme] = useState<ThemeType>(() => currentTheme || getDefaultTheme());
  const [theme, setTheme] = useState<ThemeType>(() => currentTheme || getDefaultTheme());

  const themeUtils = useThemeUtils(theme);

  // Update base theme when currentTheme prop changes
  useEffect(() => {
    if (currentTheme) {
      setBaseTheme(currentTheme);

      const savedDraft = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedDraft && !isInitialized) {
        try {
          const draftTheme = JSON.parse(savedDraft) as ThemeType;
          const mergedTheme: ThemeType = {
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

  useEffect(() => {
    if (isInitialized && currentTheme) {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
      const isDifferent = JSON.stringify(theme) !== JSON.stringify(baseTheme);
      setHasUnsavedChanges(isDifferent);
    }
  }, [theme, baseTheme, isInitialized, currentTheme]);

  const handleBaseThemeChange = (value: 'light' | 'dark') => {
    setTheme((prev) => ({
      ...prev,
      baseTheme: value,
    }));
  };

  const handleColorChange = (key: keyof ThemeType['customizations']['colors'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        colors: {
          ...prev.customizations.colors,
          [key]: value,
        },
      },
    }));
  };

  const handleButtonChange = (key: keyof ThemeType['customizations']['button'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        button: {
          ...prev.customizations.button,
          [key]: value,
        },
      },
    }));
  };

  const handleComponentStylesChange = (
    key: keyof ThemeType['customizations']['componentStyles'],
    value: string
  ) => {
    setTheme((prev) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        componentStyles: {
          ...prev.customizations.componentStyles,
          [key]: value,
        },
      },
    }));
  };

  const handleAdsChange = (
    key: keyof ThemeType['customizations']['ads'],
    value: string | string[]
  ) => {
    setTheme((prev) => ({
      ...prev,
      customizations: {
        ...prev.customizations,
        ads: {
          ...prev.customizations.ads,
          [key]: value,
        },
      },
    }));
  };

  const handleAdsImagesChange = (urls: string[]) => {
    handleAdsChange('images', urls);
  };

  const handleSaveTheme = async () => {
    setIsLoading(true);
    try {
      await onThemeChange(theme);
      localStorage.removeItem(THEME_STORAGE_KEY);
      setHasUnsavedChanges(false);
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

  if (!isInitialized || !currentTheme) {
    return (
      <Card className="bg-dark-800 text-light-400 border-dark-700">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-3" />
            <p className="text-xs">Initializing theme customizer...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {hasUnsavedChanges && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-400">
                <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">Unsaved changes</span>
              </div>
              <p className="text-xs text-amber-400/80 mt-1">
                Changes are saved as draft. Click "Save Theme" to apply permanently.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-dark-800 border border-dark-700 p-1 h-10">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs h-8">
                <Layout className="h-3.5 w-3.5 mr-1.5" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="colors"
                className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs h-8">
                <Palette className="h-3.5 w-3.5 mr-1.5" />
                Colors
              </TabsTrigger>
              <TabsTrigger
                value="buttons"
                className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs h-8">
                <MdOutlineSmartButton className="h-3.5 w-3.5 mr-1.5" />
                Buttons
              </TabsTrigger>
              <TabsTrigger
                value="components"
                className="data-[state=active]:bg-dark-700 data-[state=active]:text-white text-light-400 text-xs h-8">
                <Layers className="h-3.5 w-3.5 mr-1.5" />
                Components
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
              {/* Base Theme */}
              <Card className="bg-dark-800 border-dark-700 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-white">Base Theme</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-light-500 hover:text-light-300">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-[200px]">
                            Choose between light and dark mode as the base for your store theme
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleBaseThemeChange('light')}
                      className={cn(
                        'p-3 rounded-lg border transition-all text-left',
                        'bg-light-100 border-light-200 hover:border-primary',
                        theme.baseTheme === 'light' && 'ring-2 ring-primary'
                      )}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-dark-800">Light</span>
                      </div>
                      <div className="h-6 w-full bg-white border border-light-200 rounded flex items-center px-2">
                        <div className="h-1 w-8 bg-light-300 rounded mr-2" />
                        <div className="h-1 w-6 bg-light-200 rounded" />
                      </div>
                    </button>

                    <button
                      onClick={() => handleBaseThemeChange('dark')}
                      className={cn(
                        'p-3 rounded-lg border transition-all text-left',
                        'bg-dark-700 border-dark-600 hover:border-primary',
                        theme.baseTheme === 'dark' && 'ring-2 ring-primary'
                      )}>
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-white">Dark</span>
                      </div>
                      <div className="h-6 w-full bg-dark-800 border border-dark-600 rounded flex items-center px-2">
                        <div className="h-1 w-8 bg-dark-600 rounded mr-2" />
                        <div className="h-1 w-6 bg-dark-700 rounded" />
                      </div>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Ads Banner */}
              <Card className="bg-dark-800 border-dark-700 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-white">Banner Settings</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-light-500 hover:text-light-300">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-[200px]">
                            Upload banner images to display at the top of your store homepage
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Corner Roundness</label>
                      <Select
                        value={theme.customizations.ads.roundedness || 'md'}
                        onValueChange={(value) => handleAdsChange('roundedness', value)}>
                        <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="md">Medium</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                          <SelectItem value="full">Full Rounded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Shadow Depth</label>
                      <Select
                        value={theme.customizations.ads.shadow || 'sm'}
                        onValueChange={(value) => handleAdsChange('shadow', value)}>
                        <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          <SelectItem value="none">No Shadow</SelectItem>
                          <SelectItem value="sm">Light Shadow</SelectItem>
                          <SelectItem value="md">Medium Shadow</SelectItem>
                          <SelectItem value="lg">Heavy Shadow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-light-400">Banner Images</label>
                    <AdsBannerUploader
                      images={theme.customizations.ads.images || []}
                      onImagesChange={handleAdsImagesChange}
                      maxImages={5}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="mt-6">
              <Card className="bg-dark-800 border-dark-700 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-white">Brand Colors</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-light-500 hover:text-light-300">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-[200px]">
                            Choose colors that represent your brand identity
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Primary Color</label>
                      <ColorGrid
                        value={theme.customizations.colors.primary || 'primary'}
                        onChange={(value) => handleColorChange('primary', value)}
                        label="Primary"
                      />
                      <p className="text-xs text-light-500">
                        Used for buttons, links, and highlights
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Secondary Color</label>
                      <ColorGrid
                        value={theme.customizations.colors.secondary || 'bg-dark-800'}
                        onChange={(value) => handleColorChange('secondary', value)}
                        label="Secondary"
                      />
                      <p className="text-xs text-light-500">
                        Used for backgrounds and secondary elements
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="buttons" className="mt-6">
              <Card className="bg-dark-800 border-dark-700 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdOutlineSmartButton className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-white">Button Styles</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-light-500 hover:text-light-300">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-[200px]">
                            Customize the appearance of buttons throughout your store
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">
                          Corner Roundness
                        </label>
                        <Select
                          value={theme.customizations.button.roundedness || 'md'}
                          onValueChange={(value) => handleButtonChange('roundedness', value)}>
                          <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-dark-600">
                            <SelectItem value="none">No Rounding</SelectItem>
                            <SelectItem value="sm">Slightly Rounded</SelectItem>
                            <SelectItem value="md">Medium Rounded</SelectItem>
                            <SelectItem value="lg">Very Rounded</SelectItem>
                            <SelectItem value="full">Fully Rounded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">
                          Border Thickness
                        </label>
                        <Select
                          value={theme.customizations.button.border || 'none'}
                          onValueChange={(value) => handleButtonChange('border', value)}>
                          <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-dark-600">
                            <SelectItem value="none">No Border</SelectItem>
                            <SelectItem value="sm">Thin Border</SelectItem>
                            <SelectItem value="md">Medium Border</SelectItem>
                            <SelectItem value="lg">Thick Border</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">Shadow Depth</label>
                        <Select
                          value={theme.customizations.button.shadow || 'sm'}
                          onValueChange={(value) => handleButtonChange('shadow', value)}>
                          <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-dark-600">
                            <SelectItem value="none">No Shadow</SelectItem>
                            <SelectItem value="sm">Light Shadow</SelectItem>
                            <SelectItem value="md">Medium Shadow</SelectItem>
                            <SelectItem value="lg">Heavy Shadow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">Text Color</label>
                        <ColorGrid
                          value={theme.customizations.button.textColor || 'text-dark-800'}
                          onChange={(value) => handleButtonChange('textColor', value)}
                          label="Text"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">Background</label>
                        <ColorGrid
                          value={theme.customizations.button.backgroundColor || 'bg-primary'}
                          onChange={(value) => handleButtonChange('backgroundColor', value)}
                          label="Background"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-light-400">Border Color</label>
                        <ColorGrid
                          value={theme.customizations.button.borderColor || 'border-primary'}
                          onChange={(value) => handleButtonChange('borderColor', value)}
                          label="Border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button Preview */}
                  <div className="mt-4 p-3 border border-dark-600 rounded-md bg-dark-700">
                    <div className="text-xs text-light-400 mb-2">Button Preview:</div>
                    <div className="flex items-center justify-center p-4">
                      <button
                        className={cn(
                          'px-4 py-2 text-sm font-medium',
                          themeUtils.getButtonClass(),
                          themeUtils.getButtonRoundednessClass()
                        )}>
                        Sample Button
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="mt-6">
              <Card className="bg-dark-800 border-dark-700 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-medium text-white">Card Styles</h3>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-light-500 hover:text-light-300">
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs max-w-[200px]">
                            Customize the appearance of cards and containers in your store
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Corner Roundness</label>
                      <Select
                        value={theme.customizations.componentStyles.cardRoundedness || 'md'}
                        onValueChange={(value) =>
                          handleComponentStylesChange('cardRoundedness', value)
                        }>
                        <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          <SelectItem value="none">No Rounding</SelectItem>
                          <SelectItem value="sm">Slightly Rounded</SelectItem>
                          <SelectItem value="md">Medium Rounded</SelectItem>
                          <SelectItem value="lg">Very Rounded</SelectItem>
                          <SelectItem value="xl">Extra Rounded</SelectItem>
                          <SelectItem value="full">Fully Rounded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-light-400">Shadow Depth</label>
                      <Select
                        value={theme.customizations.componentStyles.cardShadow || 'sm'}
                        onValueChange={(value) => handleComponentStylesChange('cardShadow', value)}>
                        <SelectTrigger className="h-8 bg-dark-700 border-dark-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          <SelectItem value="none">No Shadow</SelectItem>
                          <SelectItem value="sm">Light Shadow</SelectItem>
                          <SelectItem value="md">Medium Shadow</SelectItem>
                          <SelectItem value="lg">Heavy Shadow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Card Preview */}
                  <div className="mt-4 p-3 border border-dark-600 rounded-md bg-dark-700">
                    <div className="text-xs text-light-400 mb-2">Card Preview:</div>
                    <div className="flex items-center justify-center p-4">
                      <div
                        className={cn(
                          'w-32 h-32 flex items-center justify-center',
                          themeUtils.getCardClass(),
                          themeUtils.getComponentRoundednessClass(),
                          themeUtils.getComponentShadowClass()
                        )}>
                        <span className="text-sm">Sample Card</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-dark-700">
            <Button2
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges}
              variant="outline"
              size="sm"
              className="border-dark-600 text-light-400 hover:bg-dark-700 hover:text-white h-8 text-xs">
              <RotateCcw className="h-3 w-3 mr-2" />
              Reset
            </Button2>

            <Button2
              onClick={handleSaveTheme}
              disabled={isLoading || !hasUnsavedChanges}
              size="sm"
              className="bg-primary hover:bg-primary/80 text-dark-800 h-8 text-xs">
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3 mr-2" />
                  Save Theme
                </>
              )}
            </Button2>
          </div>
        </div>
      </div>
    </div>
  );
}
