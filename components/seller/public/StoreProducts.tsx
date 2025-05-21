// src/components/StoreProducts.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import ProductCard from '../product/ProductCard';

interface StoreProductsProps {
  store: string | undefined;
}

const StoreProducts: React.FC<StoreProductsProps> = ({ store }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!store) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v3/products?store=${store}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [store]);

  return (
    <div>
      {isLoading && <p>Loading products...</p>}
      {error && <p>Error: {error}</p>}
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onEdit={() => {}} onDelete={() => {}} />
      ))}
    </div>
  );
};

export default StoreProducts;
