/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, Category } from '@/types';
import { X, RefreshCw } from 'lucide-react';
import ProductList from '@/components/shared/ProductList';
import ProductDetail from './ProductDetail';

interface StoreProductsProps {
  store: string | undefined;
  theme: any;
}

export default function StoreProducts({ store, theme }: StoreProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  useEffect(() => {
    // console.log('StoreProducts - store value:', store);
    if (!store) {
      // console.log('StoreProducts - No store value provided');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // console.log('StoreProducts - Fetching data for store:', store);
        const productsResponse = await fetch(`/api/v3/products?store=${store}`);
        if (!productsResponse.ok) {
          throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
        }
        const productsData = await productsResponse.json();
        // console.log('StoreProducts - Products data:', productsData);
        setProducts(productsData.products || []);

        const categoriesResponse = await fetch(`/api/v3/categories?store=${store}`);
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();
        // console.log('StoreProducts - Categories data:', categoriesData);
        setCategories(categoriesData.categories || []);

        // Check if there's a selected product ID in localStorage
        const selectedProductId = localStorage.getItem('selectedProductId');
        if (selectedProductId) {
          // Find the product with the matching ID
          const product = productsData.products?.find((p: Product) => p._id === selectedProductId);
          if (product) {
            setSelectedProduct(product);
            setShowProductDetail(true);
          }
          // Clear the localStorage item to prevent showing the product detail on page refresh
          localStorage.removeItem('selectedProductId');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [store]);

  const handleViewProductDetail = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowProductDetail(true);
    }
  };

  const handleBackToProducts = () => {
    setShowProductDetail(false);
    setSelectedProduct(null);
  };

  const handleBuyNow = (productId: string) => {
    // console.log('Buy now clicked for product:', productId);
    if (!showProductDetail) {
      handleViewProductDetail(productId);
    } else {
    }
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
      className="w-full py-8 min-h-[75vh]"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-10 flex justify-center">
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
          </motion.div>
        ) : showProductDetail && selectedProduct ? (
          <motion.div
            key="product-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-10 max-w-screen-lg min-h-[75vh]">
            <ProductDetail
              product={selectedProduct}
              category={categories.find((c) => c._id === selectedProduct.categoryId)}
              categories={categories}
              theme={theme}
              onBack={handleBackToProducts}
              onBuyNow={handleBuyNow}
              onViewDetails={handleViewProductDetail}
              sellerId={store}
            />
          </motion.div>
        ) : (
          <motion.div
            key="product-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <ProductList
              products={products}
              categories={categories}
              theme={theme}
              role="buyer"
              onBuyNow={handleBuyNow}
              onViewDetails={handleViewProductDetail}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
