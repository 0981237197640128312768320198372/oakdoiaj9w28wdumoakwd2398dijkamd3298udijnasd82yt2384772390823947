import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
}

const SearchPopup: React.FC<SearchPopupProps> = ({
  isOpen,
  onClose,
  onSearch,
  placeholder = 'Search products, categories...',
  recentSearches = [],
  trendingSearches = ['Netflix Premium', 'Prime Video', 'Family Access'],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-dark-800/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <motion.div
            ref={containerRef}
            className="w-full max-w-2xl bg-dark-700 border border-dark-500 rounded-lg shadow-2xl overflow-hidden"
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}>
            <form onSubmit={handleSubmit} className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
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
                className="w-full py-5 pl-12 pr-12 bg-dark-700 border-b border-dark-500 text-light-100 placeholder-light-500 focus:outline-none focus:ring-1 focus:ring-primary/50 text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-light-400 hover:text-light-200 transition-colors p-1 rounded-full hover:bg-dark-600">
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80 transition-colors p-1 rounded-full hover:bg-primary/10">
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
                        <div className="flex items-center gap-2 mb-2 text-light-300">
                          <History size={16} className="text-light-400" />
                          <h3 className="text-sm font-medium">Recent Searches</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(search)}
                              className="text-left px-3 py-2 rounded-md bg-dark-600 hover:bg-dark-500 text-light-200 text-sm transition-colors truncate">
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending searches section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-light-300">
                        <TrendingUp size={16} className="text-light-400" />
                        <h3 className="text-sm font-medium">Popular Searches</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {trendingSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(search)}
                            className="text-left px-3 py-2 rounded-md bg-dark-600 hover:bg-dark-500 text-light-200 text-sm transition-colors truncate">
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard shortcuts */}
                    <div className="mt-6 pt-4 border-t border-dark-500 flex justify-between text-xs text-light-500">
                      <p>
                        Press{' '}
                        <kbd className="px-2 py-1 bg-dark-600 rounded border border-dark-400">
                          Enter
                        </kbd>{' '}
                        to search
                      </p>
                      <p>
                        Press{' '}
                        <kbd className="px-2 py-1 bg-dark-600 rounded border border-dark-400">
                          Esc
                        </kbd>{' '}
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
