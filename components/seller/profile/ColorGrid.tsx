'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Global state to track which ColorGrid is currently open
let activeColorGridId: string | null = null;
const colorGridOpenStateListeners: Array<(id: string | null) => void> = [];

function notifyColorGridStateChange(id: string | null) {
  activeColorGridId = id;
  colorGridOpenStateListeners.forEach((listener) => listener(id));
}

interface ColorGridProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
}

export function ColorGrid({
  value,
  onChange,
  label,
  id = Math.random().toString(36).substr(2, 9),
}: ColorGridProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const colorCategories = {
    slate: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    zinc: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    neutral: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    stone: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    red: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    orange: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    amber: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    yellow: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    lime: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    green: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    emerald: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    teal: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    cyan: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    sky: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    blue: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    indigo: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    violet: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    purple: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    fuchsia: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    pink: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    rose: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  };

  const customColors = [
    { name: 'primary', class: 'primary' },
    { name: 'dark-800', class: 'dark-800' },
    { name: 'dark-700', class: 'dark-700' },
    { name: 'dark-600', class: 'dark-600' },
    { name: 'dark-500', class: 'dark-500' },
    { name: 'dark-400', class: 'dark-400' },
    { name: 'dark-300', class: 'dark-300' },
    { name: 'dark-200', class: 'dark-200' },
    { name: 'dark-100', class: 'dark-100' },
    { name: 'light-100', class: 'light-100' },
    { name: 'light-200', class: 'light-200' },
    { name: 'light-300', class: 'light-300' },
    { name: 'light-400', class: 'light-400' },
    { name: 'light-500', class: 'light-500' },
    { name: 'light-600', class: 'light-600' },
    { name: 'light-700', class: 'light-700' },
    { name: 'light-800', class: 'light-800' },
    { name: 'goldVIP', class: 'goldVIP' },
    { name: 'purpleVVIP', class: 'purpleVVIP' },
  ];

  const basicColors = [
    { name: 'white', class: 'white' },
    { name: 'black', class: 'black' },
    { name: 'transparent', class: 'transparent' },
  ];

  // Handle click outside to close popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Listen for other ColorGrid components opening
    function handleColorGridStateChange(activeId: string | null) {
      if (activeId !== id) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    colorGridOpenStateListeners.push(handleColorGridStateChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      const index = colorGridOpenStateListeners.indexOf(handleColorGridStateChange);
      if (index > -1) {
        colorGridOpenStateListeners.splice(index, 1);
      }
    };
  }, [id]);

  const handleToggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      notifyColorGridStateChange(id);
    }
  };

  const getDisplayName = () => {
    const customColor = customColors.find((color) => color.class === value);
    if (customColor) return customColor.name;

    const basicColor = basicColors.find((color) => color.class === value);
    if (basicColor) return basicColor.name;

    for (const [category, shades] of Object.entries(colorCategories)) {
      for (const shade of shades) {
        if (value === `${category}-${shade}`) {
          return `${category}-${shade}`;
        }
      }
    }

    return value;
  };

  const getPreviewClass = (colorClass: string) => {
    return `bg-${colorClass}`;
  };

  const getFilteredColors = () => {
    if (selectedCategory === 'custom') {
      return customColors;
    } else if (selectedCategory === 'basic') {
      return basicColors;
    } else if (selectedCategory === 'all') {
      return [
        ...customColors,
        ...basicColors,
        { name: 'slate-500', class: 'slate-500' },
        { name: 'gray-500', class: 'gray-500' },
        { name: 'red-500', class: 'red-500' },
        { name: 'orange-500', class: 'orange-500' },
        { name: 'amber-500', class: 'amber-500' },
        { name: 'yellow-500', class: 'yellow-500' },
        { name: 'lime-500', class: 'lime-500' },
        { name: 'green-500', class: 'green-500' },
        { name: 'emerald-500', class: 'emerald-500' },
        { name: 'teal-500', class: 'teal-500' },
        { name: 'cyan-500', class: 'cyan-500' },
        { name: 'sky-500', class: 'sky-500' },
        { name: 'blue-500', class: 'blue-500' },
        { name: 'indigo-500', class: 'indigo-500' },
        { name: 'violet-500', class: 'violet-500' },
        { name: 'purple-500', class: 'purple-500' },
        { name: 'fuchsia-500', class: 'fuchsia-500' },
        { name: 'pink-500', class: 'pink-500' },
        { name: 'rose-500', class: 'rose-500' },
      ];
    } else {
      return colorCategories[selectedCategory as keyof typeof colorCategories].map((shade) => ({
        name: `${selectedCategory}-${shade}`,
        class: `${selectedCategory}-${shade}`,
      }));
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center gap-2 p-2 border border-dark-600 rounded-md bg-dark-700 cursor-pointer"
        onClick={handleToggleOpen}>
        <div className={cn('w-6 h-6 rounded-md border border-dark-500', getPreviewClass(value))} />
        <span className="text-light-200 text-sm flex-1">{getDisplayName()}</span>
        <span className="text-light-400 text-xs">{label || 'Color'}</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 bg-dark-800 border border-dark-600 rounded-lg shadow-lg w-[320px]">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-light-200 text-sm font-medium">Select a color</span>
            <button
              className="text-light-400 hover:text-light-200 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}>
              Close
            </button>
          </div>

          {/* Color category selector */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-light-400 text-xs">Category:</span>
            <div className="relative flex-1">
              <select
                className="w-full bg-dark-700 border border-dark-600 rounded p-1 text-light-200 text-xs appearance-none pr-8"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="all">Popular Colors</option>
                <option value="custom">Custom Colors</option>
                <option value="basic">Basic Colors</option>
                {Object.keys(colorCategories).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-400 pointer-events-none" />
            </div>
          </div>

          {/* Color grid */}
          <div className="grid grid-cols-8 gap-1 max-h-[240px] overflow-y-auto p-1">
            <TooltipProvider>
              {getFilteredColors().map((color) => (
                <Tooltip key={color.class}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center border border-dark-600 transition-all',
                        getPreviewClass(color.class),
                        value === color.class &&
                          'ring-2 ring-primary ring-offset-1 ring-offset-dark-800'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(color.class);
                        setIsOpen(false);
                      }}>
                      {value === color.class && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-dark-700 text-light-200 border-dark-600">
                    <p>{color.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
}
