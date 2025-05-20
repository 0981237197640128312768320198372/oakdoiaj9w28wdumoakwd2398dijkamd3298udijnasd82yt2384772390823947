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

const getSubdomain = (hostname: string): string | null => {
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0]; // e.g., 'shop' from 'shop.localhost'
    }
  } else if (hostname.endsWith('.dokmai.store')) {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'dokmai.store') {
      return parts[0];
    }
  }
  return null;
};

export const SellerTheme = ({ children }: SellerThemeProps) => {
  const [theme, setTheme] = useState<ThemeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const subdomain = getSubdomain(hostname);
    if (subdomain) {
      setSubdomain(subdomain);
    } else {
      setError('Invalid domain or no subdomain provided.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subdomain) {
      const fetchTheme = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/v3/seller/theme?subdomain=${subdomain}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch theme: ${response.status}`);
          }
          const data = await response.json();
          if (data && typeof data === 'object') {
            setTheme(data);
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
    }
  }, [subdomain]);

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
