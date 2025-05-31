'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import type { ThemeType } from '@/types';
import { Search, Home, Package, Power, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { TbInfoHexagon } from 'react-icons/tb';
import { LuArrowUpRight } from 'react-icons/lu';

interface LivePreviewProps {
  theme: ThemeType;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ theme }) => {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  // Sample seller data for the preview
  const sampleSeller = {
    store: {
      name: 'Your Store',
      logoUrl: null,
    },
    username: 'yourstore',
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <h3 className="text-sm font-medium text-light-200 mb-2">Live Preview</h3>

      {/* Navbar Preview */}
      <div className="border border-dark-600 rounded-lg overflow-hidden">
        <div className="text-xs text-light-500 bg-dark-900 px-3 py-1.5 border-b border-dark-700">
          Store Navbar Preview
        </div>
        <div className="p-4">
          <div
            className={cn(
              'w-full border transition-all duration-300 flex items-center justify-between backdrop-blur-md',
              'py-3 px-5',
              'shadow-sm',
              themeUtils.getCardClass(),
              themeUtils.getButtonRoundednessClass()
            )}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'relative overflow-hidden transition-all duration-300',
                  'w-10 h-10',
                  themeUtils.getButtonRoundednessClass()
                )}>
                <div
                  className={cn(
                    'w-full h-full bg-gray-300',
                    isLight ? 'bg-gray-300' : 'bg-gray-700'
                  )}></div>
              </div>
              <div className="flex flex-col">
                <h1
                  className={cn(
                    'font-aktivGroteskBold text-sm tracking-wide transition-all duration-300 select-none',
                    isLight ? 'text-gray-800' : 'text-white'
                  )}>
                  {sampleSeller.store.name}
                </h1>
              </div>
            </div>

            <div className="items-center gap-1 flex">
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 relative',
                  themeUtils.getPrimaryColorClass('bg'),
                  themeUtils.getButtonRoundednessClass(),
                  themeUtils.getButtonClass()
                )}>
                <Home size={16} />
                <span className="font-medium">บ้าน</span>
              </button>
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 relative',
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-dark-700',
                  themeUtils.getButtonRoundednessClass(),
                  themeUtils.getButtonClass()
                )}>
                <TbInfoHexagon size={16} />
                <span className="font-medium">ร้านค้า</span>
              </button>
              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300 relative',
                  isLight ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-dark-700',
                  themeUtils.getButtonRoundednessClass(),
                  themeUtils.getButtonClass()
                )}>
                <Package size={16} />
                <span className="font-medium">สินค้า</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cn(
                  'flex items-center justify-center transition-all duration-300 p-2 group',
                  isLight ? 'hover:bg-light-300 bg-light-100' : 'hover:bg-dark-500 bg-dark-600',
                  themeUtils.getButtonRoundednessClass()
                )}
                aria-label="ค้นหา">
                <Search
                  size={18}
                  className={
                    isLight
                      ? 'text-dark-600 group-hover:text-dark-800'
                      : 'text-light-500 group-hover:text-light-100'
                  }
                />
              </button>

              <button
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 transition-all duration-300 text-sm',
                  themeUtils.getPrimaryColorClass('bg'),
                  themeUtils.getButtonClass(),
                  themeUtils.getButtonRoundednessClass()
                )}>
                <Power size={16} />
                <span className="font-medium">เข้าสู่ระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Card Preview */}
      <div className="border border-dark-600 rounded-lg overflow-hidden">
        <div className="text-xs text-light-500 bg-dark-900 px-3 py-1.5 border-b border-dark-700">
          Product Card Preview
        </div>
        <div className="p-4">
          <div className="max-w-[300px] mx-auto">
            <div
              className={cn(
                'group relative overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-lg',
                isLight
                  ? 'bg-light-100 border-light-300 hover:border-light-400 hover:shadow-light-300/20'
                  : 'bg-dark-600 border-dark-400 hover:border-dark-400 hover:shadow-dark-800/20',
                themeUtils.getComponentRoundednessClass()
              )}>
              <div
                className={cn(
                  'relative aspect-square w-full overflow-hidden',
                  isLight ? 'bg-light-100/50' : 'bg-dark-700/50'
                )}>
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className={cn(
                      'w-24 h-24 rounded-full',
                      isLight ? 'bg-gray-200' : 'bg-gray-700'
                    )}></div>
                </div>

                <button
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-1',
                    isLight
                      ? 'bg-light-200/90 text-dark-800 hover:bg-light-300'
                      : 'bg-dark-700/90 text-light-200 hover:bg-dark-800'
                  )}>
                  <ChevronLeft size={16} />
                </button>
                <button
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-1',
                    isLight
                      ? 'bg-light-200/90 text-dark-800 hover:bg-light-300'
                      : 'bg-dark-700/90 text-light-200 hover:bg-dark-800'
                  )}>
                  <ChevronRight size={16} />
                </button>

                <div
                  className={cn(
                    'absolute top-3 right-1 px-1 py-0.5 rounded text-sm lg:text-lg font-bold animate-bounce',
                    themeUtils.getPrimaryColorClass('bg'),
                    isLight ? 'text-light-100' : 'text-dark-800'
                  )}>
                  ลด 10%
                </div>
              </div>

              <div className={cn('p-3 space-y-2', isLight ? 'text-dark-800' : 'text-light-200')}>
                <div className="flex flex-col items-end justify-start gap-1">
                  <div
                    className={cn(
                      'flex items-center',
                      isLight ? 'text-amber-500' : 'text-amber-400'
                    )}>
                    <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          fill={4.5 >= star ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          className="mr-0.5"
                        />
                      ))}
                      <span className="text-xs ml-1 font-medium">4.5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs w-full justify-between">
                    <h3
                      className={cn(
                        'text-xs lg:text-base font-semibold line-clamp-2 w-full',
                        isLight ? 'text-dark-800' : 'text-light-200'
                      )}>
                      Sample Product
                    </h3>
                  </div>
                  <div className="flex w-full justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col lg:flex-row-reverse lg:gap-2 gap-1">
                        <span
                          className={cn(
                            'text-[12px] line-through whitespace-nowrap flex gap-2 items-center opacity-60',
                            isLight ? 'text-dark-500' : 'text-light-500'
                          )}>
                          <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                          299.00
                        </span>
                        <span
                          className={cn(
                            'text-md font-semibold whitespace-nowrap flex gap-2 items-center',
                            themeUtils.getPrimaryColorClass('text')
                          )}>
                          <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
                          269.10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    'flex items-center justify-between pt-2 mt-5 border-t',
                    isLight ? 'border-light-300' : 'border-dark-300'
                  )}>
                  <span className={cn('text-xs', isLight ? 'text-dark-600' : 'text-light-600')}>
                    พร้อมส่ง: 25
                  </span>
                  <button
                    className={cn(
                      'md:px-2 md:py-1 px-2 pt-1 rounded text-xs lg:text-lg font-medium flex items-center gap-1 hover:scale-105 transition-all duration-200',
                      themeUtils.getPrimaryColorClass('bg'),
                      isLight ? 'text-light-100' : 'text-dark-800'
                    )}>
                    ซื้อเลย
                    <LuArrowUpRight className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
