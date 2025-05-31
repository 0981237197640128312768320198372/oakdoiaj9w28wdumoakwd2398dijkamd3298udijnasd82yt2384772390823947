/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const colorGridOpenStateListeners: Array<(id: string | null) => void> = [];

function notifyColorGridStateChange(id: string | null) {
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

  // Define color categories and their shades
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const colorCategories = {
    slate: { name: 'Slate', shades },
    gray: { name: 'Gray', shades },
    red: { name: 'Red', shades },
    orange: { name: 'Orange', shades },
    amber: { name: 'Amber', shades },
    yellow: { name: 'Yellow', shades },
    lime: { name: 'Lime', shades },
    green: { name: 'Green', shades },
    emerald: { name: 'Emerald', shades },
    teal: { name: 'Teal', shades },
    cyan: { name: 'Cyan', shades },
    sky: { name: 'Sky', shades },
    blue: { name: 'Blue', shades },
    indigo: { name: 'Indigo', shades },
    violet: { name: 'Violet', shades },
    purple: { name: 'Purple', shades },
    fuchsia: { name: 'Fuchsia', shades },
    pink: { name: 'Pink', shades },
    rose: { name: 'Rose', shades },
  };

  // Define custom colors with user-friendly names
  const customColors = [
    { name: 'Primary', class: 'primary', bgClass: 'bg-primary' },
    { name: 'Dark 800', class: 'dark-800', bgClass: 'bg-gray-800' },
    { name: 'Dark 700', class: 'dark-700', bgClass: 'bg-gray-700' },
    { name: 'Dark 600', class: 'dark-600', bgClass: 'bg-gray-600' },
    { name: 'Dark 500', class: 'dark-500', bgClass: 'bg-gray-500' },
    { name: 'Dark 400', class: 'dark-400', bgClass: 'bg-gray-400' },
    { name: 'Dark 300', class: 'dark-300', bgClass: 'bg-gray-300' },
    { name: 'Dark 200', class: 'dark-200', bgClass: 'bg-gray-200' },
    { name: 'Dark 100', class: 'dark-100', bgClass: 'bg-gray-100' },
    { name: 'Light 100', class: 'light-100', bgClass: 'bg-gray-50' },
    { name: 'Light 200', class: 'light-200', bgClass: 'bg-gray-100' },
    { name: 'Light 300', class: 'light-300', bgClass: 'bg-gray-200' },
    { name: 'Light 400', class: 'light-400', bgClass: 'bg-gray-300' },
    { name: 'Light 500', class: 'light-500', bgClass: 'bg-gray-400' },
    { name: 'Light 600', class: 'light-600', bgClass: 'bg-gray-500' },
    { name: 'Light 700', class: 'light-700', bgClass: 'bg-gray-600' },
    { name: 'Light 800', class: 'light-800', bgClass: 'bg-gray-700' },
  ];

  // Define basic colors with user-friendly names
  const basicColors = [
    { name: 'White', class: 'white', bgClass: 'bg-white' },
    { name: 'Black', class: 'black', bgClass: 'bg-black' },
    { name: 'Transparent', class: 'transparent', bgClass: 'bg-transparent' },
  ];

  // Generate all tailwind colors from categories
  const tailwindColors = Object.entries(colorCategories).flatMap(([category, { name, shades }]) =>
    shades.map((shade) => ({
      name: `${name} ${shade}`,
      class: `${category}-${shade}`,
      bgClass: `bg-${category}-${shade}`,
    }))
  );

  // Combine all colors into a single array
  const allColors = [...customColors, ...basicColors, ...tailwindColors];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

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
    const color = allColors.find((color) => color.class === value);
    return color ? color.name : value;
  };

  const getColorBgClass = (colorClass: string) => {
    const color = allColors.find((c) => c.class === colorClass);
    return color ? color.bgClass : 'bg-transparent';
  };

  const getFilteredColors = () => {
    if (selectedCategory === 'all') {
      return allColors;
    } else if (selectedCategory === 'custom') {
      return customColors;
    } else if (selectedCategory === 'basic') {
      return basicColors;
    } else {
      return tailwindColors.filter((color) => color.class.startsWith(`${selectedCategory}-`));
    }
  };

  // Debug function to log color information
  const debugColor = () => {
    console.log('Current value:', value);
    console.log(
      'Found in allColors:',
      allColors.find((c) => c.class === value)
    );
    console.log('Background class:', getColorBgClass(value));
    console.log('All colors count:', allColors.length);
    console.log('Custom colors:', customColors);
    console.log('Basic colors:', basicColors);
    console.log('Tailwind colors sample:', tailwindColors.slice(0, 5));
  };

  // Call debug function once
  useEffect(() => {
    debugColor();
  }, [value]);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center gap-2 p-2 border border-dark-600 rounded-md bg-dark-700 cursor-pointer"
        onClick={handleToggleOpen}>
        <div className={cn('w-6 h-6 rounded-md border border-dark-500', getColorBgClass(value))} />
        <span className="text-light-200 text-sm flex-1">{getDisplayName()}</span>
        <span className="text-light-400 text-xs">{label || 'Color'}</span>
        <span className="text-xs text-light-400 ml-1">{value}</span>
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
                <option value="all">All Colors</option>
                <option value="custom">Custom Colors</option>
                <option value="basic">Basic Colors</option>
                {Object.entries(colorCategories).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
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
                        color.bgClass,
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
                    <p className="text-xs text-light-400">{color.class}</p>
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
