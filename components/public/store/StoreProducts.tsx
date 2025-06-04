/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Product, Category } from '@/types';
import { X, RefreshCw } from 'lucide-react';
import ProductList from '@/components/shared/ProductList';
/* Removed unused useThemeUtils import */

interface StoreProductsProps {
  store: string | undefined;
  theme: any;
}

export default function StoreProducts({ store, theme }: StoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // We need the theme for the ProductList component

  useEffect(() => {
    if (!store) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch products
        const productsResponse = await fetch(`/api/v3/products?store=${store}`);
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);

        // Fetch categories
        const categoriesResponse = await fetch(`/api/v3/categories?store=${store}`);
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [store]);

  // Handle buy now action
  const handleBuyNow = (productId: string) => {
    console.log('Buy now clicked for product:', productId);
    // Implement buy now functionality here
    // For example, redirect to product page or add to cart
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="w-full py-8 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      {error ? (
        <div className="w-full py-10 flex justify-center">
          <div className="px-6 py-5 max-w-md shadow-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <span className="p-1 bg-red-500/20 hover:bg-red-500/30">
                <X size={18} />
              </span>
              Error Loading Products
            </h3>
            <p className="text-sm opacity-90 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm flex items-center gap-2 transition-colors px-4 py-2 bg-red-500/20 hover:bg-red-500/30">
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      ) : (
        <ProductList
          products={products}
          categories={categories}
          theme={theme}
          role="buyer"
          onBuyNow={handleBuyNow}
          isLoading={isLoading}
        />
      )}
    </motion.div>
  );
}
