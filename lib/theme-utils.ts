import { cn } from '@/lib/utils';
import type { ThemeType } from '@/types';

export interface ThemeUtilsReturn {
  // Base theme values
  baseTheme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;

  // Button values
  buttonTextColor: string;
  buttonBgColor: string;
  buttonRoundedness: string;
  buttonShadow: string;
  buttonBorder: string;
  buttonBorderColor: string;

  // Component values
  componentRoundedness: string;
  componentShadow: string;

  // Ads values
  adsRoundedness: string;
  adsShadow: string;
  adsImages: string[];

  // Helper functions
  getButtonRoundednessClass: () => string;
  getComponentRoundednessClass: () => string;
  getButtonShadowClass: () => string;
  getComponentShadowClass: () => string;
  getAdsShadowClass: () => string;
  getAdsRoundednessClass: () => string;
  getButtonBorderClass: () => string;
  buildColorClass: (colorValue: string, type: 'bg' | 'text' | 'border') => string;

  // Theme-aware style objects
  getNavbarStyles: () => {
    background: string;
    text: string;
    searchButton: string;
    storeBadge: string;
    mobileNav: string;
  };

  getFooterStyles: () => {
    background: string;
    text: string;
    secondaryText: string;
    cardBg: string;
    hoverBg: string;
    searchBg: string;
  };

  getButtonClass: (variant?: 'primary' | 'secondary' | 'outline') => string;
  getCardClass: () => string;
  getTextColors: () => string;

  // Color utilities
  getPrimaryColorClass: (type: 'bg' | 'text' | 'border') => string;
  getSecondaryColorClass: (type: 'bg' | 'text' | 'border') => string;
}

export function useThemeUtils(theme: ThemeType | null): ThemeUtilsReturn {
  // Extract base values with fallbacks
  const baseTheme = theme?.baseTheme || 'dark';
  const primaryColor = theme?.customizations?.colors?.primary || 'primary';
  const secondaryColor = theme?.customizations?.colors?.secondary || 'bg-dark-800';

  // Button values
  const buttonTextColor = theme?.customizations?.button?.textColor || 'text-dark-800';
  const buttonBgColor = theme?.customizations?.button?.backgroundColor || 'bg-primary';
  const buttonRoundedness = theme?.customizations?.button?.roundedness || 'md';
  const buttonShadow = theme?.customizations?.button?.shadow || 'sm';
  const buttonBorder = theme?.customizations?.button?.border || 'none';
  const buttonBorderColor = theme?.customizations?.button?.borderColor || 'border-primary';

  // Component values
  const componentRoundedness = theme?.customizations?.componentStyles?.cardRoundedness || 'md';
  const componentShadow = theme?.customizations?.componentStyles?.cardShadow || 'sm';

  // Ads values
  const adsRoundedness = theme?.customizations?.ads?.roundedness || 'md';
  const adsShadow = theme?.customizations?.ads?.shadow || 'sm';
  const adsImages = theme?.customizations?.ads?.images || [];

  // Helper functions
  const getButtonRoundednessClass = (): string => {
    switch (buttonRoundedness) {
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

  const getComponentRoundednessClass = (): string => {
    switch (componentRoundedness) {
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

  const getAdsRoundednessClass = (): string => {
    switch (adsRoundedness) {
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

  const getButtonShadowClass = (): string => {
    switch (buttonShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getComponentShadowClass = (): string => {
    switch (componentShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getAdsShadowClass = (): string => {
    switch (adsShadow) {
      case 'none':
        return 'shadow-none';
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return 'shadow-sm';
    }
  };

  const getButtonBorderClass = (): string => {
    if (buttonBorder === 'none') return 'border-0';

    const borderWidth =
      {
        sm: 'border',
        md: 'border-2',
        lg: 'border-4',
      }[buttonBorder] || 'border';

    return `${borderWidth} ${buttonBorderColor}`;
  };

  const buildColorClass = (colorValue: string, type: 'bg' | 'text' | 'border'): string => {
    if (colorValue === 'primary') {
      return type === 'bg' ? 'bg-primary' : type === 'text' ? 'text-primary' : 'border-primary';
    }

    if (colorValue.startsWith(`${type}-`)) {
      return colorValue;
    }

    return `${type}-${colorValue}`;
  };

  // Theme-aware style objects
  const getNavbarStyles = () => ({
    background: baseTheme === 'light' ? 'bg-white border-light-200' : 'bg-dark-700 border-dark-500',
    text: baseTheme === 'light' ? 'text-dark-800' : 'text-light-100',
    searchButton:
      baseTheme === 'light'
        ? 'bg-light-100 hover:bg-light-300 duration-300 transition-all text-dark-500 shadow-md'
        : 'bg-dark-600 hover:bg-dark-500 duration-300 transition-all text-light-300 border-[1px] border-dark-400 shadow-md',
    storeBadge:
      baseTheme === 'light'
        ? 'border-light-200 hover:bg-light-200 hover:border-light-400'
        : 'bg-dark-700 border-dark-600 hover:bg-dark-600 hover:border-dark-500',
    mobileNav:
      baseTheme === 'light'
        ? 'bg-white/5 border-light-400/50 shadow shadow-black/20'
        : 'bg-dark-800/5 border-dark-500 shadow-black',
  });

  const getFooterStyles = () => ({
    background: baseTheme === 'light' ? 'bg-light-100' : 'bg-dark-900',
    text: baseTheme === 'light' ? 'text-dark-800' : 'text-light-100',
    secondaryText: baseTheme === 'light' ? 'text-dark-600' : 'text-light-400',
    cardBg: baseTheme === 'light' ? 'bg-white border-light-200' : 'bg-dark-700 border-dark-500',
    hoverBg: baseTheme === 'light' ? 'hover:bg-light-200' : 'hover:bg-dark-600',
    searchBg:
      baseTheme === 'light' ? 'bg-light-200 border-light-300' : 'bg-dark-600 border-dark-500',
  });

  // Pre-built component classes
  const getButtonClass = (variant: 'primary' | 'secondary' | 'outline' = 'primary'): string => {
    const baseClasses = 'flex items-center gap-2 px-4 py-2 font-medium transition-all duration-200';
    const roundednessClass = getButtonRoundednessClass();
    const shadowClass = getButtonShadowClass();
    const borderClass = getButtonBorderClass();

    switch (variant) {
      case 'primary':
        return cn(
          baseClasses,
          buildColorClass(buttonBgColor, 'bg'),
          buildColorClass(buttonTextColor, 'text'),
          borderClass,
          shadowClass,
          roundednessClass,
          'hover:opacity-90'
        );
      case 'secondary':
        return cn(
          baseClasses,
          baseTheme === 'light'
            ? 'bg-light-200 text-dark-600 hover:bg-light-300'
            : 'bg-dark-600 text-light-300 hover:bg-dark-500',
          roundednessClass,
          shadowClass,
          'border border-transparent'
        );
      case 'outline':
        return cn(
          baseClasses,
          'bg-transparent',
          buildColorClass(primaryColor, 'text'),
          buildColorClass(primaryColor, 'border'),
          'border hover:bg-opacity-10',
          roundednessClass
        );
      default:
        return cn(baseClasses, roundednessClass);
    }
  };

  const getCardClass = (): string => {
    return cn(
      'border-[1px]',
      baseTheme === 'light'
        ? 'bg-white border-light-200 !text-dark-800'
        : 'bg-dark-700 border-dark-500 !text-light-100',
      getComponentShadowClass()
    );
  };
  const getTextColors = (): string => {
    return cn(baseTheme === 'light' ? '!text-black' : '!text-white');
  };

  // Color utilities
  const getPrimaryColorClass = (type: 'bg' | 'text' | 'border'): string => {
    return buildColorClass(primaryColor, type);
  };

  const getSecondaryColorClass = (type: 'bg' | 'text' | 'border'): string => {
    return buildColorClass(secondaryColor, type);
  };

  return {
    // Base values
    baseTheme,
    primaryColor,
    secondaryColor,

    // Button values
    buttonTextColor,
    buttonBgColor,
    buttonRoundedness,
    buttonShadow,
    buttonBorder,
    buttonBorderColor,

    // Component values
    componentRoundedness,
    componentShadow,

    // Ads values
    adsRoundedness,
    adsShadow,
    adsImages,

    // Helper functions
    getButtonRoundednessClass,
    getComponentRoundednessClass,
    getButtonShadowClass,
    getComponentShadowClass,
    getAdsShadowClass,
    getAdsRoundednessClass,
    getButtonBorderClass,
    buildColorClass,

    // Theme-aware styles
    getNavbarStyles,
    getFooterStyles,
    getButtonClass,
    getCardClass,
    getTextColors,

    // Color utilities
    getPrimaryColorClass,
    getSecondaryColorClass,
  };
}

// Additional utility for common theme patterns
export const createThemeVariant = (
  theme: ThemeType | null,
  overrides?: Partial<ThemeType['customizations']>
): ThemeType | null => {
  if (!theme) return null;

  return {
    ...theme,
    customizations: {
      ...theme.customizations,
      ...overrides,
      colors: {
        ...theme.customizations.colors,
        ...overrides?.colors,
      },
      button: {
        ...theme.customizations.button,
        ...overrides?.button,
      },
      componentStyles: {
        ...theme.customizations.componentStyles,
        ...overrides?.componentStyles,
      },
      ads: {
        ...theme.customizations.ads,
        ...overrides?.ads,
      },
    },
  };
};

// Hook for theme-aware responsive classes
export const useResponsiveTheme = (theme: ThemeType | null) => {
  const utils = useThemeUtils(theme);

  return {
    ...utils,
    // Responsive button classes
    getResponsiveButtonClass: (size: 'sm' | 'md' | 'lg' = 'md') => {
      const baseClass = utils.getButtonClass();
      const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      };
      return cn(baseClass, sizeClasses[size]);
    },

    // Responsive card classes
    getResponsiveCardClass: (padding: 'sm' | 'md' | 'lg' = 'md') => {
      const baseClass = utils.getCardClass();
      const paddingClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      };
      return cn(baseClass, paddingClasses[padding]);
    },
  };
};
