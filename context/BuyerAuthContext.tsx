'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Updated Buyer type definition to match new structure
interface BuyerContact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string; // Add avatarUrl field
  contact: BuyerContact;
  balance: number;
  createdAt: string;
  updatedAt: string;
  iat?: number;
  exp?: number;
}

// Auth context type
interface BuyerAuthContextType {
  buyer: Buyer | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const BuyerAuthContext = createContext<BuyerAuthContextType | undefined>(undefined);

export const BuyerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('buyerToken');
    if (token) {
      try {
        const decoded = jwtDecode<Buyer>(token);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('buyerToken');
          setBuyer(null);
        } else {
          setBuyer(decoded);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('buyerToken');
        setBuyer(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('buyerToken', token);
    try {
      const decoded = jwtDecode<Buyer>(token);

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('buyerToken');
        setBuyer(null);
        throw new Error('Token expired');
      } else {
        setBuyer(decoded);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('buyerToken');
      setBuyer(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('buyerToken');
    setBuyer(null);
  };

  const isAuthenticated = buyer !== null;

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}>
      {children}
    </BuyerAuthContext.Provider>
  );
};

export const useBuyerAuth = () => {
  const context = useContext(BuyerAuthContext);
  if (context === undefined) {
    throw new Error('useBuyerAuth must be used within a BuyerAuthProvider');
  }
  return context;
};
