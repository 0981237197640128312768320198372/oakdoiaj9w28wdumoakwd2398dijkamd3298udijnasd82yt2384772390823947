/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-comment-textnodes */
'use client';

import { cn } from '@/lib/utils';
import { Smartphone, Monitor } from 'lucide-react';

interface ResponsiveImagePlaceholderProps {
  className?: string;
  showDimensions?: boolean;
}

export function ResponsiveImagePlaceholder({
  className,
  showDimensions = true,
}: ResponsiveImagePlaceholderProps) {
  return (
    <div className="space-y-4">
      {/* Desktop Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-light-300">
          <Monitor size={16} />
          <span>Desktop (16:9 - Good)</span>
        </div>
        <div
          className={cn(
            'relative w-full bg-gradient-to-br from-green-800/20 to-green-900/20 border-2 border-dashed border-green-600/50 rounded-lg overflow-hidden',
            'flex flex-col items-center justify-center text-center p-3',
            'aspect-[16/9]',
            className
          )}>
          <div className="text-xs text-green-400 space-y-1">
            <p>✓ Perfect for desktop viewing</p>
            <p>✓ Good visual impact</p>
            <p>Recommended: 1920×1080px</p>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-light-300">
          <Smartphone size={16} />
          <span>Mobile (16:9 - Too Wide)</span>
        </div>
        <div className="max-w-[200px]">
          <div
            className={cn(
              'relative w-full bg-gradient-to-br from-red-800/20 to-red-900/20 border-2 border-dashed border-red-600/50 rounded-lg overflow-hidden',
              'flex flex-col items-center justify-center text-center p-2',
              'aspect-[16/9]'
            )}>
            <div className="text-xs text-red-400 space-y-1">
              <p>⚠ Very short height</p>
              <p>⚠ Poor visual impact</p>
              <p>⚠ Wasted screen space</p>
            </div>
          </div>
        </div>
      </div>

      {/* Better Mobile Alternative */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-light-300">
          <Smartphone size={16} />
          <span>Mobile (4:3 - Better)</span>
        </div>
        <div className="max-w-[200px]">
          <div
            className={cn(
              'relative w-full bg-gradient-to-br from-blue-800/20 to-blue-900/20 border-2 border-dashed border-blue-600/50 rounded-lg overflow-hidden',
              'flex flex-col items-center justify-center text-center p-3',
              'aspect-[4/3]'
            )}>
            <div className="text-xs text-blue-400 space-y-1">
              <p>✓ Better height</p>
              <p>✓ Good visual impact</p>
              <p>✓ Efficient space use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Solution */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
        <h4 className="text-primary font-medium text-sm mb-2">💡 Recommended Solution</h4>
        <div className="text-xs text-light-300 space-y-2">
          <p>
            <strong>Use CSS aspect-ratio with responsive breakpoints:</strong>
          </p>
          <div className="bg-dark-800 p-3 rounded font-mono text-xs">
            <p className="text-green-400">/* Desktop: 16:9 */</p>
            <p>md:aspect-[16/9]</p>
            <p className="text-blue-400 mt-2">/* Mobile: 4:3 or 3:2 */</p>
            <p>aspect-[4/3] sm:aspect-[3/2]</p>
          </div>
          <p>
            <strong>Image Requirements:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-light-400">
            <li>Minimum: 1200×900px (4:3 safe area)</li>
            <li>Optimal: 1920×1440px (can crop to any ratio)</li>
            <li>Keep important content in center 4:3 area</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
