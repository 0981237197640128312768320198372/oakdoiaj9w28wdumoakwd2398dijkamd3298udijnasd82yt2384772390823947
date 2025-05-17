'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContextType, Seller } from '@/types';

const SellerAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SellerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [seller, setSeller] = useState<Seller | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      try {
        const decoded = jwtDecode<Seller>(token);
        setSeller(decoded);
      } catch (error) {
        console.error('Invalid token');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    try {
      const decoded = jwtDecode<Seller>(token);
      setSeller(decoded);
    } catch (error) {
      console.error('Invalid token');
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setSeller(null);
  };
  return (
    <SellerAuthContext.Provider value={{ seller, login, logout }}>
      {children}
    </SellerAuthContext.Provider>
  );
};

export const useSellerAuth = () => {
  const context = useContext(SellerAuthContext);
  if (context === undefined) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
};
