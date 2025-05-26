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

  // Define color mappings with actual CSS values to ensure they're available
  const colorMap: Record<string, string> = {
    // Custom colors
    primary: '#3b82f6', // blue-500 equivalent
    'dark-800': '#1f2937',
    'dark-700': '#374151',
    'dark-600': '#4b5563',
    'dark-500': '#6b7280',
    'dark-400': '#9ca3af',
    'dark-300': '#d1d5db',
    'dark-200': '#e5e7eb',
    'dark-100': '#f3f4f6',
    'light-100': '#f9fafb',
    'light-200': '#f3f4f6',
    'light-300': '#e5e7eb',
    'light-400': '#d1d5db',
    'light-500': '#9ca3af',
    'light-600': '#6b7280',
    'light-700': '#4b5563',
    'light-800': '#374151',
    // Basic colors
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    // Tailwind colors
    'slate-50': '#f8fafc',
    'slate-100': '#f1f5f9',
    'slate-200': '#e2e8f0',
    'slate-300': '#cbd5e1',
    'slate-400': '#94a3b8',
    'slate-500': '#64748b',
    'slate-600': '#475569',
    'slate-700': '#334155',
    'slate-800': '#1e293b',
    'slate-900': '#0f172a',
    'slate-950': '#020617',
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',
    'gray-950': '#030712',
    'red-50': '#fef2f2',
    'red-100': '#fee2e2',
    'red-200': '#fecaca',
    'red-300': '#fca5a5',
    'red-400': '#f87171',
    'red-500': '#ef4444',
    'red-600': '#dc2626',
    'red-700': '#b91c1c',
    'red-800': '#991b1b',
    'red-900': '#7f1d1d',
    'red-950': '#450a0a',
    'orange-50': '#fff7ed',
    'orange-100': '#ffedd5',
    'orange-200': '#fed7aa',
    'orange-300': '#fdba74',
    'orange-400': '#fb923c',
    'orange-500': '#f97316',
    'orange-600': '#ea580c',
    'orange-700': '#c2410c',
    'orange-800': '#9a3412',
    'orange-900': '#7c2d12',
    'orange-950': '#431407',
    'amber-50': '#fffbeb',
    'amber-100': '#fef3c7',
    'amber-200': '#fde68a',
    'amber-300': '#fcd34d',
    'amber-400': '#fbbf24',
    'amber-500': '#f59e0b',
    'amber-600': '#d97706',
    'amber-700': '#b45309',
    'amber-800': '#92400e',
    'amber-900': '#78350f',
    'amber-950': '#451a03',
    'yellow-50': '#fefce8',
    'yellow-100': '#fef9c3',
    'yellow-200': '#fef08a',
    'yellow-300': '#fde047',
    'yellow-400': '#facc15',
    'yellow-500': '#eab308',
    'yellow-600': '#ca8a04',
    'yellow-700': '#a16207',
    'yellow-800': '#854d0e',
    'yellow-900': '#713f12',
    'yellow-950': '#422006',
    'lime-50': '#f7fee7',
    'lime-100': '#ecfccb',
    'lime-200': '#d9f99d',
    'lime-300': '#bef264',
    'lime-400': '#a3e635',
    'lime-500': '#84cc16',
    'lime-600': '#65a30d',
    'lime-700': '#4d7c0f',
    'lime-800': '#365314',
    'lime-900': '#1a2e05',
    'lime-950': '#0a0a00',
    'green-50': '#f0fdf4',
    'green-100': '#dcfce7',
    'green-200': '#bbf7d0',
    'green-300': '#86efac',
    'green-400': '#4ade80',
    'green-500': '#22c55e',
    'green-600': '#16a34a',
    'green-700': '#15803d',
    'green-800': '#166534',
    'green-900': '#14532d',
    'green-950': '#052e16',
    'emerald-50': '#ecfdf5',
    'emerald-100': '#d1fae5',
    'emerald-200': '#a7f3d0',
    'emerald-300': '#6ee7b7',
    'emerald-400': '#34d399',
    'emerald-500': '#10b981',
    'emerald-600': '#059669',
    'emerald-700': '#047857',
    'emerald-800': '#065f46',
    'emerald-900': '#064e3b',
    'emerald-950': '#022c22',
    'teal-50': '#f0fdfa',
    'teal-100': '#ccfbf1',
    'teal-200': '#99f6e4',
    'teal-300': '#5eead4',
    'teal-400': '#2dd4bf',
    'teal-500': '#14b8a6',
    'teal-600': '#0d9488',
    'teal-700': '#0f766e',
    'teal-800': '#115e59',
    'teal-900': '#134e4a',
    'teal-950': '#042f2e',
    'cyan-50': '#ecfeff',
    'cyan-100': '#cffafe',
    'cyan-200': '#a5f3fc',
    'cyan-300': '#67e8f9',
    'cyan-400': '#22d3ee',
    'cyan-500': '#06b6d4',
    'cyan-600': '#0891b2',
    'cyan-700': '#0e7490',
    'cyan-800': '#155e75',
    'cyan-900': '#164e63',
    'cyan-950': '#083344',
    'sky-50': '#f0f9ff',
    'sky-100': '#e0f2fe',
    'sky-200': '#bae6fd',
    'sky-300': '#7dd3fc',
    'sky-400': '#38bdf8',
    'sky-500': '#0ea5e9',
    'sky-600': '#0284c7',
    'sky-700': '#0369a1',
    'sky-800': '#075985',
    'sky-900': '#0c4a6e',
    'sky-950': '#082f49',
    'blue-50': '#eff6ff',
    'blue-100': '#dbeafe',
    'blue-200': '#bfdbfe',
    'blue-300': '#93c5fd',
    'blue-400': '#60a5fa',
    'blue-500': '#3b82f6',
    'blue-600': '#2563eb',
    'blue-700': '#1d4ed8',
    'blue-800': '#1e40af',
    'blue-900': '#1e3a8a',
    'blue-950': '#172554',
    'indigo-50': '#eef2ff',
    'indigo-100': '#e0e7ff',
    'indigo-200': '#c7d2fe',
    'indigo-300': '#a5b4fc',
    'indigo-400': '#818cf8',
    'indigo-500': '#6366f1',
    'indigo-600': '#4f46e5',
    'indigo-700': '#4338ca',
    'indigo-800': '#3730a3',
    'indigo-900': '#312e81',
    'indigo-950': '#1e1b4b',
    'violet-50': '#f5f3ff',
    'violet-100': '#ede9fe',
    'violet-200': '#ddd6fe',
    'violet-300': '#c4b5fd',
    'violet-400': '#a78bfa',
    'violet-500': '#8b5cf6',
    'violet-600': '#7c3aed',
    'violet-700': '#6d28d9',
    'violet-800': '#5b21b6',
    'violet-900': '#4c1d95',
    'violet-950': '#2e1065',
    'purple-50': '#faf5ff',
    'purple-100': '#f3e8ff',
    'purple-200': '#e9d5ff',
    'purple-300': '#d8b4fe',
    'purple-400': '#c084fc',
    'purple-500': '#a855f7',
    'purple-600': '#9333ea',
    'purple-700': '#7e22ce',
    'purple-800': '#6b21a8',
    'purple-900': '#581c87',
    'purple-950': '#3b0764',
    'fuchsia-50': '#fdf4ff',
    'fuchsia-100': '#fae8ff',
    'fuchsia-200': '#f5d0fe',
    'fuchsia-300': '#f0abfc',
    'fuchsia-400': '#e879f9',
    'fuchsia-500': '#d946ef',
    'fuchsia-600': '#c026d3',
    'fuchsia-700': '#a21caf',
    'fuchsia-800': '#86198f',
    'fuchsia-900': '#701a75',
    'fuchsia-950': '#4a044e',
    'pink-50': '#fdf2f8',
    'pink-100': '#fce7f3',
    'pink-200': '#fbcfe8',
    'pink-300': '#f9a8d4',
    'pink-400': '#f472b6',
    'pink-500': '#ec4899',
    'pink-600': '#db2777',
    'pink-700': '#be185d',
    'pink-800': '#9d174d',
    'pink-900': '#831843',
    'pink-950': '#500724',
    'rose-50': '#fff1f2',
    'rose-100': '#ffe4e6',
    'rose-200': '#fecdd3',
    'rose-300': '#fda4af',
    'rose-400': '#fb7185',
    'rose-500': '#f43f5e',
    'rose-600': '#e11d48',
    'rose-700': '#be123c',
    'rose-800': '#9f1239',
    'rose-900': '#881337',
    'rose-950': '#4c0519',
  };

  const colorCategories = {
    slate: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    gray: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
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
  ];

  const basicColors = [
    { name: 'white', class: 'white' },
    { name: 'black', class: 'black' },
    { name: 'transparent', class: 'transparent' },
  ];

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

  const getPreviewStyle = (colorClass: string) => {
    const color = colorMap[colorClass];
    if (color) {
      return { backgroundColor: color };
    }
    // Fallback to Tailwind class if color mapping doesn't exist
    return {};
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
      return (
        colorCategories[selectedCategory as keyof typeof colorCategories]?.map((shade) => ({
          name: `${selectedCategory}-${shade}`,
          class: `${selectedCategory}-${shade}`,
        })) || []
      );
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex items-center gap-2 p-2 border border-dark-600 rounded-md bg-dark-700 cursor-pointer"
        onClick={handleToggleOpen}>
        <div className="w-6 h-6 rounded-md border border-dark-500" style={getPreviewStyle(value)} />
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
                        value === color.class &&
                          'ring-2 ring-primary ring-offset-1 ring-offset-dark-800'
                      )}
                      style={getPreviewStyle(color.class)}
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
