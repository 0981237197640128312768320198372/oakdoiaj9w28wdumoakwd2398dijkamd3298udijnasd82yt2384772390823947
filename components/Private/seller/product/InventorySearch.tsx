'use client';
import React, { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal, Calendar, Tag, RefreshCw } from 'lucide-react';
import { Button2 } from '@/components/ui/button2';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOption: 'all' | 'linked' | 'unlinked';
  onFilterChange: (value: 'all' | 'linked' | 'unlinked') => void;
  onRefresh: () => void;
}

const InventorySearch: React.FC<InventorySearchProps> = ({
  searchTerm,
  onSearchChange,
  filterOption,
  onFilterChange,
  onRefresh,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    // Reset the refreshing state after animation completes
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col gap-3 w-full">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-grow">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search inventory..."
              className="pl-10 pr-10 py-2.5 w-full bg-dark-600 border border-dark-400 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-500 hover:text-light-300"
                aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <select
              value={filterOption}
              onChange={(e) => onFilterChange(e.target.value as 'all' | 'linked' | 'unlinked')}
              className="appearance-none pl-10 pr-8 py-2.5 w-full bg-dark-600 border-dark-400 border hover:text-primary rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
              <option value="all">All inventory</option>
              <option value="linked">Linked only</option>
              <option value="unlinked">Unlinked only</option>
            </select>
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-500"
              size={16}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L2 4H10L6 8Z" fill="currentColor" className="text-light-500" />
              </svg>
            </div>
          </div>

          <Button2
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`h-10 px-3 text-light-400 hover:text-primary transition-colors rounded-lg bg-dark-600 border border-dark-400 flex items-center gap-1 ${
              showAdvancedFilters ? 'bg-dark-600 text-primary border-primary/30' : ''
            }`}
            title="Advanced filters">
            <SlidersHorizontal size={16} />
            <span className="text-sm hidden sm:inline">Filters</span>
          </Button2>

          <Button2
            variant="outline"
            onClick={handleRefresh}
            className="h-10 w-10 p-2.5 text-light-400 hover:text-primary transition-colors rounded-lg bg-dark-600 border border-dark-400"
            title="Refresh data">
            <RefreshCw
              size={18}
              className={`${isRefreshing ? 'animate-spin' : 'hover:animate-spin'}`}
            />
          </Button2>
        </div>
      </div>

      {/* Advanced filters panel */}
      {showAdvancedFilters && (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-light-200">Advanced Filters</h3>
            <Button2
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(false)}
              className="h-7 px-2 text-xs text-light-500 hover:text-light-300">
              <X size={14} className="mr-1" />
              Close
            </Button2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                <Calendar size={12} />
                Date Added
              </label>
              <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                <option value="any">Any time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            {/* Asset count filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                <Tag size={12} />
                Asset Count
              </label>
              <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                <option value="any">Any count</option>
                <option value="empty">Empty (0)</option>
                <option value="low">Low (1-5)</option>
                <option value="medium">Medium (6-20)</option>
                <option value="high">High (20+)</option>
              </select>
            </div>

            {/* Sort order */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs font-medium text-light-400">
                <SlidersHorizontal size={12} />
                Sort By
              </label>
              <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-light-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50">
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="assets_desc">Most assets</option>
                <option value="assets_asc">Fewest assets</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end mt-4 pt-3 border-t border-dark-600 gap-2">
            <Button2
              variant="outline"
              size="sm"
              className="h-9 text-xs bg-dark-700 text-light-400 border-dark-600 hover:bg-dark-600 order-2 sm:order-1">
              Reset Filters
            </Button2>
            <Button2
              size="sm"
              className="h-9 text-xs bg-primary hover:bg-primary order-1 sm:order-2">
              Apply Filters
            </Button2>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySearch;
