/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
  theme?: any;
}

const SearchPopup: React.FC<SearchPopupProps> = ({
  isOpen,
  onClose,
  onSearch,
  placeholder = 'Search products, categories...',
  recentSearches = [],
  trendingSearches = ['Netflix Premium', 'Prime Video', 'Family Access'],
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the centralized theme utility
  const themeUtils = useThemeUtils(theme);

  const getPopupStyles = () => {
    const isLight = themeUtils.baseTheme === 'light';
    return {
      overlay: 'bg-dark-800/80 backdrop-blur-md',
      container: isLight ? 'bg-light-100 border-light-300' : 'bg-dark-700 border-dark-500',
      input: isLight
        ? 'bg-light-100 border-light-300 text-dark-800 placeholder-dark-500'
        : 'bg-dark-700 border-dark-500 text-light-100 placeholder-light-500',
      text: isLight ? 'text-dark-800' : 'text-light-100',
      secondaryText: isLight ? 'text-dark-600' : 'text-light-300',
      mutedText: isLight ? 'text-dark-500' : 'text-light-500',
      button: isLight
        ? 'bg-light-200 hover:bg-light-300 text-dark-800'
        : 'bg-dark-600 hover:bg-dark-500 text-light-200',
      hoverBg: isLight ? 'hover:bg-light-200' : 'hover:bg-dark-600',
      kbd: isLight ? 'bg-light-200 border-light-400' : 'bg-dark-600 border-dark-400',
    };
  };

  const popupStyles = getPopupStyles();

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setShowSuggestions(true);
    } else {
      setSearchQuery('');
      setShowSuggestions(false);
    }
  }, [isOpen]);

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-start justify-center pt-20',
            popupStyles.overlay
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <motion.div
            ref={containerRef}
            className={cn(
              'w-full max-w-2xl border shadow-2xl overflow-hidden',
              popupStyles.container,
              themeUtils.getComponentRoundednessClass()
            )}
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}>
            <form onSubmit={handleSubmit} className="relative">
              <Search
                className={cn(
                  'absolute left-4 top-1/2 transform -translate-y-1/2',
                  themeUtils.getPrimaryColorClass('text')
                )}
                size={20}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={placeholder}
                className={cn(
                  'w-full py-5 pl-12 pr-12 border-b focus:outline-none text-lg',
                  `focus:ring-1 focus:ring-${themeUtils.primaryColor}/50`,
                  popupStyles.input
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'absolute right-12 top-1/2 transform -translate-y-1/2 transition-colors p-1',
                    themeUtils.getButtonRoundednessClass(),
                    popupStyles.secondaryText,
                    popupStyles.hoverBg
                  )}>
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className={cn(
                  'absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors p-1',
                  themeUtils.getButtonRoundednessClass(),
                  themeUtils.getPrimaryColorClass('text'),
                  `hover:bg-${themeUtils.primaryColor}/10`
                )}>
                <Search size={18} />
              </button>
            </form>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden">
                  <div className="p-4 max-h-[60vh] overflow-y-auto __dokmai_scrollbar">
                    {/* Recent searches section */}
                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <div
                          className={cn('flex items-center gap-2 mb-2', popupStyles.secondaryText)}>
                          <History size={16} className={popupStyles.mutedText} />
                          <h3 className="text-sm font-medium">Recent Searches</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(search)}
                              className={cn(
                                'text-left px-3 py-2 text-sm transition-colors truncate',
                                themeUtils.getButtonRoundednessClass(),
                                popupStyles.button
                              )}>
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending searches section */}
                    <div>
                      <div
                        className={cn('flex items-center gap-2 mb-2', popupStyles.secondaryText)}>
                        <TrendingUp size={16} className={popupStyles.mutedText} />
                        <h3 className="text-sm font-medium">Popular Searches</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {trendingSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(search)}
                            className={cn(
                              'text-left px-3 py-2 text-sm transition-colors truncate',
                              themeUtils.getButtonRoundednessClass(),
                              popupStyles.button
                            )}>
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard shortcuts */}
                    <div
                      className={cn(
                        'mt-6 pt-4 border-t flex justify-between text-xs',
                        popupStyles.mutedText,
                        popupStyles.input.includes('border-light')
                          ? 'border-light-300'
                          : 'border-dark-500'
                      )}>
                      <p>
                        Press{' '}
                        <kbd className={cn('px-2 py-1 rounded border', popupStyles.kbd)}>Enter</kbd>{' '}
                        to search
                      </p>
                      <p>
                        Press{' '}
                        <kbd className={cn('px-2 py-1 rounded border', popupStyles.kbd)}>Esc</kbd>{' '}
                        to close
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchPopup;
