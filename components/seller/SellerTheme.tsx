/* eslint-disable react-hooks/exhaustive-deps */
// components/seller/SellerTheme.tsx
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
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/v3/seller/theme?subdomain=${subdomain}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch theme: ${response.status}`);
        }
        const data = await response.json();
        console.log('aowkaokwaok', data);
        if (data && typeof data === 'object') {
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
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      console.log();
      const subdomain = hostname.includes('.localhost:3000')
        ? hostname.split('.')[0]
        : hostname.includes('.dokmai.store')
        ? hostname.split('.')[0]
        : null;
      setSubdomain(subdomain);
      if (subdomain) {
        fetchTheme();
      } else {
        setLoading(false);
      }
    }
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
