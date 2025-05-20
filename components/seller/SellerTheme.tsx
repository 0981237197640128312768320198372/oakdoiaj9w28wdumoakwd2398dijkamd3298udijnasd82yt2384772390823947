'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface ThemeType {
  adsImageUrl: string;
  backgroundImage: string;
  buttonBgColor: string;
  buttonBorder: string;
  buttonTextColor: string;
  fontFamily: string;
  primaryColor: string;
  roundedness: string;
  secondaryColor: string;
  shadow: string;
  spacing: string;
  textColor: string;
}

interface ThemeContextProps {
  theme: ThemeType | null;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface SellerThemeProps {
  children: React.ReactNode;
}

export const SellerTheme = ({ children }: SellerThemeProps) => {
  const [theme, setTheme] = useState<ThemeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSubdomain = () => {
      const hostname = window.location.hostname;

      if (hostname.endsWith('.localhost')) {
        const parts = hostname.split('.');
        if (parts.length >= 2) {
          return parts[0]; // Returns "shop"
        }
      }
      return null;
    };

    const subdomain = getSubdomain();
    console.log('Subdomain:', subdomain);

    if (!subdomain) {
      setError('No subdomain found');
      setLoading(false);
      return;
    }

    const fetchTheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/v3/seller/theme?subdomain=${subdomain}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch theme: ${response.status}`);
        }
        const data = await response.json();
        if (data.theme && typeof data.theme === 'object') {
          setTheme(data.theme);
        } else {
          throw new Error('Invalid theme data received');
        }
      } catch (err) {
        setError(`Failed to load theme for ${subdomain}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  if (loading) {
    return <div>Loading theme...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a SellerTheme');
  }
  return context;
};
