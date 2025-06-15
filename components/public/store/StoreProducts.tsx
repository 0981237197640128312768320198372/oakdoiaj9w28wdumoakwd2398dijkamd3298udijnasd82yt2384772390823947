/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types';
import { X, RefreshCw } from 'lucide-react';
import ProductList from '@/components/shared/ProductList';
import ProductDetail from './ProductDetail';
import { useStoreData } from '@/context/StoreDataContext';

interface StoreProductsProps {
  store: string | undefined;
  theme: any;
}

export default function StoreProducts({ store, theme }: StoreProductsProps) {
  const { products, categories, isLoading, error, fetchStoreData } = useStoreData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  useEffect(() => {
    // Check if there's a selected product ID in localStorage
    const selectedProductId = localStorage.getItem('selectedProductId');
    if (selectedProductId && products.length > 0) {
      const product = products.find((p: Product) => p._id === selectedProductId);
      if (product) {
        setSelectedProduct(product);
        setShowProductDetail(true);
      }
      localStorage.removeItem('selectedProductId');
    }
  }, [products]);

  // Only fetch if we don't have data and store is available
  useEffect(() => {
    if (store && products.length === 0 && !isLoading) {
      fetchStoreData(store);
    }
  }, [store, products.length, isLoading, fetchStoreData]);

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
      className="w-full min-h-[75vh] pt-10 lg:pt-0"
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
              onViewDetails={handleViewProductDetail}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
