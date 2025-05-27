'use client';

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Store, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dokmaicoin from '@/assets/images/dokmaicoin3d.png';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { FiDelete } from 'react-icons/fi';

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
  theme?: any;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, storeUsername, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const themeUtils = useThemeUtils(theme);

  const getModalStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      overlay: 'bg-dark-800/80 backdrop-blur-sm',
      modal: isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-500',
      text: isLight ? 'text-dark-800' : 'text-light-100',
      secondaryText: isLight ? 'text-dark-600' : 'text-light-400',
      hoverBg: isLight ? 'hover:bg-light-200' : 'hover:bg-dark-600',
      itemBg: isLight ? 'bg-light-200' : 'bg-dark-500',
    };
  };

  const modalStyles = getModalStyles();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      setNoResults(false);
      return;
    }

    setIsLoading(true);
    setNoResults(false);

    try {
      const response = await fetch(`/api/v3/products?store=${storeUsername}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      const products = data.products || [];

      const filteredProducts = products.filter(
        (product: any) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const sellerResponse = await fetch('/api/v3/seller/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: storeUsername }),
      });

      if (!sellerResponse.ok) throw new Error('Failed to fetch seller details');

      const sellerData = await sellerResponse.json();
      const seller = sellerData.seller;

      const sellerMatches =
        seller.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.store.description.toLowerCase().includes(searchTerm.toLowerCase());

      let searchResults: SearchResult[] = [];

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
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center pt-20 px-4',
        modalStyles.overlay
      )}>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className={cn('w-full max-w-2xl shadow-xl overflow-hidden ', themeUtils.getTextColors())}>
        <div className={cn('relative flex items-center')}>
          <Search
            className={cn('absolute left-4', themeUtils.getPrimaryColorClass('text'))}
            size={18}
          />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Anything you want..."
            className={cn(
              'w-full py-4 pl-12 pr-12 focus:outline-none',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass()
            )}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={cn(
                'absolute right-12 p-1 transition-colors rounded-full',
                modalStyles.secondaryText,
                modalStyles.hoverBg
              )}>
              <FiDelete size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className={cn(
              'absolute right-4 p-1 transition-colors rounded-full',
              modalStyles.secondaryText,
              modalStyles.hoverBg
            )}>
            <X size={18} />
          </button>
        </div>

        <div
          className={cn(
            'max-h-[70vh] overflow-y-auto __dokmai_scrollbar mt-5',
            themeUtils.getCardClass(),
            themeUtils.getComponentRoundednessClass()
          )}>
          <AnimatePresence>
            {isLoading ? (
              <div className="p-8 text-center">
                <div
                  className={cn(
                    'inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mb-2',
                    themeUtils.getPrimaryColorClass('border')
                  )}></div>
                <p className={modalStyles.secondaryText}>Searching...</p>
              </div>
            ) : noResults ? (
              <div className="p-8 text-center">
                <p className={modalStyles.secondaryText}>No results found for "{searchTerm}"</p>
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
                      className={cn(
                        'flex items-center gap-4 p-3 transition-colors',
                        themeUtils.getComponentRoundednessClass(),
                        modalStyles.hoverBg
                      )}>
                      {/* Image or icon */}
                      <div
                        className={cn(
                          'w-12 h-12 flex-shrink-0 overflow-hidden flex items-center justify-center',
                          modalStyles.itemBg,
                          themeUtils.getComponentRoundednessClass()
                        )}>
                        {result.image ? (
                          <Image
                            src={result.image || '/placeholder.svg'}
                            alt={result.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Store className={modalStyles.secondaryText} size={24} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn('font-medium text-sm truncate', modalStyles.text)}>
                          {result.title}
                        </h4>
                        {result.description && (
                          <p className={cn('text-xs line-clamp-1', modalStyles.secondaryText)}>
                            {result.description}
                          </p>
                        )}
                        {result.price && (
                          <div className="flex items-center mt-1">
                            <Image
                              src={dokmaicoin || '/placeholder.svg'}
                              alt="Dokmai Coin"
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            <span
                              className={cn(
                                'text-xs font-black',
                                themeUtils.getPrimaryColorClass('text')
                              )}>
                              {result.discountedPrice !== result.price ? (
                                <>
                                  <span
                                    className={cn('line-through mr-1', modalStyles.secondaryText)}>
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

                      <ChevronRight size={16} className={modalStyles.secondaryText} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="p-8 text-center">
                <p className={modalStyles.secondaryText}>Type to search</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className={cn('mx-auto mb-2', modalStyles.secondaryText)} size={24} />
                <p className={modalStyles.secondaryText}>Search for products or information</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SearchModal;
