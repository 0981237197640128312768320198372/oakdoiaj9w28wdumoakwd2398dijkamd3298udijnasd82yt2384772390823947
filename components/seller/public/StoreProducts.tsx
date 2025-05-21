'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import Image from 'next/image';
import { Search, ShoppingCart, Star, Tag, Filter, Package } from 'lucide-react';
import dokmaicoin from '@/assets/images/dokmaicoin3d.png';

interface StoreProductsProps {
  store: string | undefined;
}

const StoreProducts: React.FC<StoreProductsProps> = ({ store }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Set<string>>(new Set());

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
        setFilteredProducts(data.products);

        // Extract unique categories
        const uniqueCategories = new Set<string>();
        data.products.forEach((product: Product) => {
          if (product.type) {
            uniqueCategories.add(product.type);
          }
        });
        setCategories(uniqueCategories);
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [store]);

  useEffect(() => {
    // Filter products based on search term and category
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.type === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-dark-700/50 rounded-xl overflow-hidden border border-dark-600 animate-pulse">
              <div className="h-48 bg-dark-600"></div>
              <div className="p-4">
                <div className="h-6 bg-dark-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-dark-600 rounded w-full mb-1"></div>
                <div className="h-4 bg-dark-600 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-dark-600 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 flex justify-center">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full py-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        variants={itemVariants}>
        <h2 className="text-2xl font-bold">Products</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            />
          </div>

          {categories.size > 0 && (
            <div className="relative">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="appearance-none w-full pl-10 pr-8 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm">
                <option value="">All Categories</option>
                {Array.from(categories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-400 h-4 w-4" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {filteredProducts.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          variants={itemVariants}>
          <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center mb-4">
            <ShoppingCart className="h-8 w-8 text-light-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-light-400 max-w-md">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : "This store doesn't have any products yet"}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price;

  return (
    <motion.div
      className="group bg-dark-700/50 rounded-xl overflow-hidden border border-dark-600 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
      }}>
      <div className="relative aspect-square overflow-hidden bg-dark-800/50">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-light-500/20" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-dark-800/80 backdrop-blur-sm border border-dark-600">
          {product.status === 'active' ? (
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              Available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              Coming Soon
            </span>
          )}
        </div>

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-primary text-dark-800 px-2 py-1 rounded-full text-xs font-bold">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-medium line-clamp-1">{product.title}</h3>
          <div className="flex items-center gap-1 text-xs bg-dark-600/80 px-1.5 py-0.5 rounded">
            <Tag className="h-3 w-3" />
            <span>{product.type}</span>
          </div>
        </div>

        <p className="text-light-400 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-end justify-between">
          <div className="flex items-center">
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-xs line-through text-light-500 flex items-center gap-1">
                  <Image src={dokmaicoin} alt="Dokmai Coin" width={12} height={12} />
                  {product.price.toFixed(2)}
                </span>
                <span className="text-base font-semibold text-primary flex items-center gap-1">
                  <Image src={dokmaicoin} alt="Dokmai Coin" width={16} height={16} />
                  {discountedPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-base font-semibold text-primary flex items-center gap-1">
                <Image src={dokmaicoin} alt="Dokmai Coin" width={16} height={16} />
                {product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center gap-0.5 text-yellow-400">
              <Star className="h-3 w-3 fill-yellow-400" />
              <span>{product.rating || '0.0'}</span>
            </div>
            <span className="text-light-500">•</span>
            <span className="text-light-500">Stock: {product.stock}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreProducts;
