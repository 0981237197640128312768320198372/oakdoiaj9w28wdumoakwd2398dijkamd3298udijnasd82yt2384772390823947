'use client';

import React from 'react';
import Image from 'next/image';
import { Category, Product, ThemeType } from '@/types';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { AiOutlineProduct } from 'react-icons/ai';
import { ArrowRight, Package } from 'lucide-react';

interface ProductsCategoryProps {
  categories: Category[];
  products: Product[];
  theme: ThemeType;
  onNavigate: (path: string) => void;
}

export default function ProductsCategory({
  categories,
  products,
  theme,
  onNavigate,
}: ProductsCategoryProps) {
  const themeUtils = useThemeUtils(theme);

  const countFor = (categoryId: string) =>
    products.filter((p) => p.categoryId === categoryId).length;

  return (
    <div className="space-y-6 w-full">
      <div
        className={cn(
          'flex justify-between items-center w-full border-b pb-4',
          themeUtils.getPrimaryColorClass('border')
        )}>
        <h2 className="lg:text-xl text-sm font-semibold flex gap-2 items-center">
          <AiOutlineProduct className="text-2xl" />
          แอพพรีเมียมที่มีขายในร้านเรา
        </h2>
        <button
          onClick={() => onNavigate('products')}
          className={cn(
            'flex items-center gap-1 py-2 px-3 lg:text-sm text-xs transition-all duration-200',
            themeUtils.getPrimaryColorClass('bg'),
            themeUtils.getButtonClass(),
            themeUtils.getButtonRoundednessClass(),
            themeUtils.getPrimaryColorClass('border')
          )}>
          ดูเพิ่มเติม <ArrowRight size={16} />
        </button>
      </div>

      {/* Horizontal Slider Container */}
      <div className="relative">
        {/* Theme-aware gradient fade indicators */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none',
            themeUtils.baseTheme === 'light'
              ? 'bg-gradient-to-r from-white to-transparent'
              : 'bg-gradient-to-r from-dark-900 to-transparent'
          )}
        />
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none',
            themeUtils.baseTheme === 'light'
              ? 'bg-gradient-to-l from-white to-transparent'
              : 'bg-gradient-to-l from-dark-900 to-transparent'
          )}
        />

        {/* Scrollable container */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-2"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}>
          {categories.map((category) => (
            <div
              key={category._id}
              className={cn(
                'flex-shrink-0 p-4 relative flex justify-center flex-col items-center gap-3 transition-all duration-300 hover:shadow-lg cursor-pointer group',
                'w-24 sm:w-28 md:w-32 lg:w-36',
                themeUtils.getCardClass(),
                themeUtils.getComponentRoundednessClass(),
                themeUtils.getComponentShadowClass()
              )}
              style={{ scrollSnapAlign: 'start' }}>
              {/* Image container with improved aspect ratio */}
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-lg">
                {category.logoUrl ? (
                  <Image
                    src={category.logoUrl}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain transition-transform duration-300 "
                  />
                ) : (
                  <div
                    className={cn(
                      'w-full h-full flex items-center justify-center text-xs text-center p-2 rounded-lg',
                      themeUtils.baseTheme === 'light'
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-dark-600 text-light-400'
                    )}>
                    {category.name}
                  </div>
                )}
              </div>

              {/* Category name - hidden on small screens to save space */}
              <div
                className={cn(
                  'hidden sm:block text-xs text-center font-medium truncate w-full',
                  themeUtils.getTextColors()
                )}>
                {category.name}
              </div>

              {/* Product count badge */}
              <div
                className={cn(
                  'absolute -top-2 -right-2 p-1 px-2 text-xs font-bold flex items-center gap-1 shadow-md transition-all duration-300',
                  themeUtils.getTextColors(),
                  themeUtils.getCardClass(),
                  themeUtils.getButtonRoundednessClass()
                )}>
                <Package size={10} />
                <span className="text-xs">{countFor(category._id)}</span>
              </div>
            </div>
          ))}

          {/* Spacer for better end scrolling */}
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>

      {/* Theme-aware custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Custom scrollbar for desktop */
        @media (min-width: 768px) {
          .scrollbar-hide {
            scrollbar-width: thin;
            scrollbar-color: ${themeUtils.baseTheme === 'light'
              ? 'rgba(156, 163, 175, 0.5) transparent'
              : 'rgba(75, 85, 99, 0.5) transparent'};
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: block;
            height: 4px;
          }
          .scrollbar-hide::-webkit-scrollbar-track {
            background: ${themeUtils.baseTheme === 'light'
              ? 'rgba(156, 163, 175, 0.1)'
              : 'rgba(75, 85, 99, 0.1)'};
            border-radius: 2px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb {
            background: ${themeUtils.baseTheme === 'light'
              ? 'rgba(156, 163, 175, 0.5)'
              : 'rgba(75, 85, 99, 0.5)'};
            border-radius: 2px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb:hover {
            background: ${themeUtils.baseTheme === 'light'
              ? 'rgba(156, 163, 175, 0.7)'
              : 'rgba(75, 85, 99, 0.7)'};
          }
        }
      `}</style>
    </div>
  );
}
