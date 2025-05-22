/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Store, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dokmaicoin from '@/assets/images/dokmaicoin3d.png';

interface SearchResult {
  type: 'product' | 'seller';
  id: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  discountedPrice?: number;
  url: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeUsername: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, storeUsername }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Search function
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    setNoResults(false);

    try {
      // Fetch products from the store
      const response = await fetch(`/api/v3/products?store=${storeUsername}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      const products = data.products || [];

      // Filter products based on search term
      const filteredProducts = products.filter(
        (product: any) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Get seller info
      const sellerResponse = await fetch('/api/v3/seller/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: storeUsername }),
      });

      if (!sellerResponse.ok) throw new Error('Failed to fetch seller details');

      const sellerData = await sellerResponse.json();
      const seller = sellerData.seller;

      // Check if seller info matches search term
      const sellerMatches =
        seller.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.store.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Combine results
      let searchResults: SearchResult[] = [];

      // Add seller if it matches
      if (sellerMatches) {
        searchResults.push({
          type: 'seller',
          id: seller._id,
          title: seller.store.name,
          description: seller.store.description,
          image: seller.store.logoUrl,
          url: `/${storeUsername}`,
        });
      }

      // Add products
      searchResults = [
        ...searchResults,
        ...filteredProducts.map((product: any) => ({
          type: 'product',
          id: product._id,
          title: product.title,
          description: product.description,
          image: product.images[0] || null,
          price: product.price,
          discountedPrice: product.discountedPrice,
          url: `/${storeUsername}/product/${product._id}`,
        })),
      ];

      setResults(searchResults);
      setNoResults(searchResults.length === 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-dark-800/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-dark-700 rounded-xl border border-dark-500 shadow-xl overflow-hidden">
        {/* Search input */}
        <div className="relative flex items-center border-b border-dark-500">
          <Search className="absolute left-4 text-light-400" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full py-4 pl-12 pr-12 bg-transparent text-light-100 placeholder-light-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-12 text-light-400 hover:text-light-200 p-1">
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 text-light-400 hover:text-light-200 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[70vh] overflow-y-auto __dokmai_scrollbar">
          <AnimatePresence>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-light-400">Searching...</p>
              </div>
            ) : noResults ? (
              <div className="p-8 text-center">
                <p className="text-light-400">No results found for "{searchTerm}"</p>
              </div>
            ) : results.length > 0 ? (
              <div className="p-2">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <Link
                      href={result.url}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-600 transition-colors">
                      {/* Image or icon */}
                      <div className="w-12 h-12 flex-shrink-0 bg-dark-500 rounded-md overflow-hidden flex items-center justify-center">
                        {result.image ? (
                          <Image
                            src={result.image}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Store className="text-light-400" size={24} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-light-100 font-medium text-sm truncate">
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className="text-light-400 text-xs line-clamp-1">
                            {result.description}
                          </p>
                        )}
                        {result.price && (
                          <div className="flex items-center mt-1">
                            <Image
                              src={dokmaicoin}
                              alt="Dokmai Coin"
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            <span className="text-xs text-primary font-medium">
                              {result.discountedPrice !== result.price ? (
                                <>
                                  <span className="line-through text-light-500 mr-1">
                                    {result.price}
                                  </span>
                                  {result.discountedPrice}
                                </>
                              ) : (
                                result.price
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={16} className="text-light-400" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="p-8 text-center">
                <p className="text-light-400">Type to search</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="mx-auto text-light-500 mb-2" size={24} />
                <p className="text-light-400">Search for products or information</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchModal;
