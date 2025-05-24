'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorGridProps {
  value: string;
  onChange: (value: string) => void;
  colorType?: 'primary' | 'secondary' | 'text' | 'button' | 'border';
}

export function ColorGrid({ value, onChange, colorType = 'primary' }: ColorGridProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Tailwind color palettes
  const colors = {
    primary: [
      { name: 'slate-500', hex: '#64748b' },
      { name: 'gray-500', hex: '#6b7280' },
      { name: 'zinc-500', hex: '#71717a' },
      { name: 'neutral-500', hex: '#737373' },
      { name: 'stone-500', hex: '#78716c' },
      { name: 'red-500', hex: '#ef4444' },
      { name: 'orange-500', hex: '#f97316' },
      { name: 'amber-500', hex: '#f59e0b' },
      { name: 'yellow-500', hex: '#eab308' },
      { name: 'lime-500', hex: '#84cc16' },
      { name: 'green-500', hex: '#22c55e' },
      { name: 'emerald-500', hex: '#10b981' },
      { name: 'teal-500', hex: '#14b8a6' },
      { name: 'cyan-500', hex: '#06b6d4' },
      { name: 'sky-500', hex: '#0ea5e9' },
      { name: 'blue-500', hex: '#3b82f6' },
      { name: 'indigo-500', hex: '#6366f1' },
      { name: 'violet-500', hex: '#8b5cf6' },
      { name: 'purple-500', hex: '#a855f7' },
      { name: 'fuchsia-500', hex: '#d946ef' },
      { name: 'pink-500', hex: '#ec4899' },
      { name: 'rose-500', hex: '#f43f5e' },
    ],
    secondary: [
      { name: 'slate-700', hex: '#334155' },
      { name: 'gray-700', hex: '#374151' },
      { name: 'zinc-700', hex: '#3f3f46' },
      { name: 'neutral-700', hex: '#404040' },
      { name: 'stone-700', hex: '#44403c' },
      { name: 'slate-800', hex: '#1e293b' },
      { name: 'gray-800', hex: '#1f2937' },
      { name: 'zinc-800', hex: '#27272a' },
      { name: 'neutral-800', hex: '#262626' },
      { name: 'stone-800', hex: '#292524' },
      { name: 'slate-900', hex: '#0f172a' },
      { name: 'gray-900', hex: '#111827' },
      { name: 'zinc-900', hex: '#18181b' },
      { name: 'neutral-900', hex: '#171717' },
      { name: 'stone-900', hex: '#1c1917' },
    ],
    text: [
      { name: 'white', hex: '#ffffff' },
      { name: 'slate-50', hex: '#f8fafc' },
      { name: 'gray-50', hex: '#f9fafb' },
      { name: 'zinc-50', hex: '#fafafa' },
      { name: 'slate-100', hex: '#f1f5f9' },
      { name: 'gray-100', hex: '#f3f4f6' },
      { name: 'zinc-100', hex: '#f4f4f5' },
      { name: 'slate-200', hex: '#e2e8f0' },
      { name: 'gray-200', hex: '#e5e7eb' },
      { name: 'zinc-200', hex: '#e4e4e7' },
    ],
    button: [
      { name: 'slate-500', hex: '#64748b' },
      { name: 'gray-500', hex: '#6b7280' },
      { name: 'red-500', hex: '#ef4444' },
      { name: 'orange-500', hex: '#f97316' },
      { name: 'amber-500', hex: '#f59e0b' },
      { name: 'yellow-500', hex: '#eab308' },
      { name: 'lime-500', hex: '#84cc16' },
      { name: 'green-500', hex: '#22c55e' },
      { name: 'emerald-500', hex: '#10b981' },
      { name: 'teal-500', hex: '#14b8a6' },
      { name: 'cyan-500', hex: '#06b6d4' },
      { name: 'sky-500', hex: '#0ea5e9' },
      { name: 'blue-500', hex: '#3b82f6' },
      { name: 'indigo-500', hex: '#6366f1' },
      { name: 'violet-500', hex: '#8b5cf6' },
      { name: 'purple-500', hex: '#a855f7' },
      { name: 'fuchsia-500', hex: '#d946ef' },
      { name: 'pink-500', hex: '#ec4899' },
      { name: 'rose-500', hex: '#f43f5e' },
    ],
    border: [
      { name: 'slate-300', hex: '#cbd5e1' },
      { name: 'gray-300', hex: '#d1d5db' },
      { name: 'zinc-300', hex: '#d4d4d8' },
      { name: 'neutral-300', hex: '#d4d4d4' },
      { name: 'stone-300', hex: '#d6d3d1' },
      { name: 'red-300', hex: '#fca5a5' },
      { name: 'orange-300', hex: '#fdba74' },
      { name: 'amber-300', hex: '#fcd34d' },
      { name: 'yellow-300', hex: '#fde047' },
      { name: 'lime-300', hex: '#bef264' },
      { name: 'green-300', hex: '#86efac' },
      { name: 'emerald-300', hex: '#6ee7b7' },
      { name: 'teal-300', hex: '#5eead4' },
      { name: 'cyan-300', hex: '#67e8f9' },
      { name: 'sky-300', hex: '#7dd3fc' },
      { name: 'blue-300', hex: '#93c5fd' },
      { name: 'indigo-300', hex: '#a5b4fc' },
      { name: 'violet-300', hex: '#c4b5fd' },
      { name: 'purple-300', hex: '#d8b4fe' },
      { name: 'fuchsia-300', hex: '#f0abfc' },
      { name: 'pink-300', hex: '#f9a8d4' },
      { name: 'rose-300', hex: '#fda4af' },
    ],
  };

  const colorPalette = colors[colorType];

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 p-2 border border-dark-600 rounded-md bg-dark-700 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        <div
          className="w-6 h-6 rounded-md border border-dark-500"
          style={{ backgroundColor: value }}
        />
        <span className="text-light-200 text-sm flex-1">{value}</span>
        <span className="text-light-400 text-xs">
          {colorType === 'primary'
            ? 'Primary'
            : colorType === 'secondary'
            ? 'Secondary'
            : colorType === 'text'
            ? 'Text'
            : colorType === 'border'
            ? 'Border'
            : 'Button'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-3 bg-dark-800 border border-dark-600 rounded-lg shadow-lg w-[280px]">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-light-200 text-sm font-medium">Select a color</span>
            <button
              className="text-light-400 hover:text-light-200 text-xs"
              onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            <TooltipProvider>
              {colorPalette.map((color) => (
                <Tooltip key={color.name}>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center border border-dark-600 transition-all',
                        value === color.hex &&
                          'ring-2 ring-primary-500 ring-offset-1 ring-offset-dark-800'
                      )}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => {
                        onChange(color.hex);
                        setIsOpen(false);
                      }}>
                      {value === color.hex && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-dark-700 text-light-200 border-dark-600">
                    <p>{color.name}</p>
                    <p className="text-xs text-light-400">{color.hex}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          <div className="mt-3 pt-3 border-t border-dark-600">
            <div className="flex items-center gap-2">
              <span className="text-light-400 text-xs">Custom:</span>
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 rounded bg-dark-700 border-0 cursor-pointer"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-dark-700 border border-dark-600 rounded p-1 text-light-200 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
