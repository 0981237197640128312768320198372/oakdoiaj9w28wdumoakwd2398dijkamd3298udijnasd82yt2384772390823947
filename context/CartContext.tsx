'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type CartItem = {
  id: string;
  appName: string;
  duration: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number, maxStock?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
  getCartItemQuantity: (id: string) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, item];
    });
  };

  const updateQuantity = (id: string, quantity: number, maxStock?: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          let newQuantity = Math.max(1, quantity);
          // If maxStock is provided, don't exceed it
          if (maxStock !== undefined) {
            newQuantity = Math.min(newQuantity, maxStock);
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getCartItemQuantity = (id: string) => {
    const item = cart.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        getCartItemQuantity,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
