'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Product, Category } from '@/types';

interface StoreDataContextType {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  setStoreData: (products: Product[], categories: Category[]) => void;
  fetchStoreData: (store: string, force?: boolean) => Promise<void>;
  clearStoreData: () => void;
}

const StoreDataContext = createContext<StoreDataContextType | undefined>(undefined);

interface StoreDataProviderProps {
  children: React.ReactNode;
  initialProducts?: Product[];
  initialCategories?: Category[];
}

export function StoreDataProvider({
  children,
  initialProducts = [],
  initialCategories = [],
}: StoreDataProviderProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current store and prevent duplicate requests
  const currentStoreRef = useRef<string>('');
  const fetchingRef = useRef<boolean>(false);
  const lastFetchTimeRef = useRef<number>(0);

  const setStoreData = useCallback((newProducts: Product[], newCategories: Category[]) => {
    setProducts(newProducts);
    setCategories(newCategories);
    setError(null);
  }, []);

  const fetchStoreData = useCallback(
    async (store: string, force = false) => {
      // Prevent duplicate requests
      if (fetchingRef.current && !force) {
        return;
      }

      // If we already have data for this store and it's recent (within 30 seconds), skip
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      if (
        !force &&
        currentStoreRef.current === store &&
        products.length > 0 &&
        timeSinceLastFetch < 30000
      ) {
        return;
      }

      fetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const productsResponse = await fetch(`/api/v3/products?store=${store}`);
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }

        const productsData = await productsResponse.json();
        const fetchedProducts = productsData.products || [];

        let fetchedCategories: Category[] = [];

        // Only fetch categories if we have products
        if (fetchedProducts.length > 0) {
          const categoryIds = [
            ...new Set(fetchedProducts.map((product: Product) => product.categoryId)),
          ];

          if (categoryIds.length > 0) {
            const categoriesResponse = await fetch(
              `/api/v3/categories?ids=${categoryIds.join(',')}`
            );
            if (categoriesResponse.ok) {
              const categoriesData = await categoriesResponse.json();
              fetchedCategories = categoriesData.categories || [];
            }
          }
        }

        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        currentStoreRef.current = store;
        lastFetchTimeRef.current = now;
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [products.length]
  );

  const clearStoreData = useCallback(() => {
    setProducts([]);
    setCategories([]);
    setError(null);
    currentStoreRef.current = '';
    lastFetchTimeRef.current = 0;
  }, []);

  const value: StoreDataContextType = {
    products,
    categories,
    isLoading,
    error,
    setStoreData,
    fetchStoreData,
    clearStoreData,
  };

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (context === undefined) {
    throw new Error('useStoreData must be used within a StoreDataProvider');
  }
  return context;
}
