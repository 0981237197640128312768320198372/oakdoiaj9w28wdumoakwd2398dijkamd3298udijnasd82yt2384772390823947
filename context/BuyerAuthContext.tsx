'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Updated Buyer type definition to match new structure
interface BuyerContact {
  facebook?: string;
  line?: string;
  instagram?: string;
  whatsapp?: string;
}

interface Balance {
  _id: string;
  buyerId: string;
  balanceType: string;
  amount: number;
  currency: string;
  status: string;
  lastUpdated: string;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  contact: BuyerContact;
  balance: Balance | number | null;
  balanceId?: string;
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
  refreshBalance: () => Promise<void>;
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
    window.location.reload();
  };

  const refreshBalance = useCallback(async () => {
    if (!buyer || !buyer.id) return;

    const token = localStorage.getItem('buyerToken');
    if (!token) return;

    try {
      console.log('Refreshing balance for buyer:', buyer.email || buyer.username);

      const res = await fetch('/api/v3/balance/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ buyer: buyer.email || buyer.username }),
      });

      console.log('Balance API response status:', res.status);

      if (!res.ok) throw new Error('Failed to fetch balance');

      const data = await res.json();
      console.log('Balance API response data:', data);

      // Update buyer state with new balance
      setBuyer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          balance: data.balance,
        };
      });

      console.log('Balance updated successfully');
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [buyer]);

  const isAuthenticated = buyer !== null;

  return (
    <BuyerAuthContext.Provider
      value={{
        buyer,
        login,
        logout,
        isAuthenticated,
        isLoading,
        refreshBalance,
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
