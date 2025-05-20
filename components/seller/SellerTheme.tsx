'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface ThemeType {
  primaryColor: string;
  textColor: string;
  fontFamily: string;
}

interface ThemeContextProps {
  theme: ThemeType | null;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface SellerThemeProps {
  children: React.ReactNode;
  subdomain: string;
}

export const SellerTheme = ({ children, subdomain }: SellerThemeProps) => {
  const [theme, setTheme] = useState<ThemeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setTheme(data.theme);
      } catch (err) {
        setError(`Failed to load theme for ${subdomain}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [subdomain]);

  if (loading) {
    return <div>Loading theme...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log('Theme:', theme);
  console.log('Primary Color:', theme?.primaryColor);

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        style={{ fontFamily: theme?.fontFamily }}
        className={`!text-[${theme?.primaryColor}] p-5 min-h-screen  overflow-x-hidden selection:bg-primary/10 selection:text-primary flex flex-col justify-start w-full items-center`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a SellerTheme');
  }
  return context;
};
