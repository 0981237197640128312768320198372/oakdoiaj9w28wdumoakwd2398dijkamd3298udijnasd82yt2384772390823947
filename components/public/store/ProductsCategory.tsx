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
    <div className="space-y-5 w-full">
      <div
        className={cn(
          'flex justify-between items-center w-full border-b pb-5',
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

      <div className="relative">
        <div
          className="flex gap-5 overflow-x-auto scrollbar-hide "
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}>
          {categories.map((category) => (
            <div
              key={category._id}
              className={cn(
                'flex-shrink-0 relative flex justify-center flex-col p-5 items-center transition-all duration-300 hover:shadow-lg cursor-pointer group'
              )}
              style={{ scrollSnapAlign: 'start' }}>
              <div
                className={cn(
                  'w-full aspect-square flex items-center justify-center p-5',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass(),
                  themeUtils.getComponentShadowClass()
                )}>
                <div
                  className={cn(
                    'absolute top-1 right-1 p-1 px-2 text-sm font-bold flex items-center gap-1 shadow-md transition-all duration-300',
                    themeUtils.getTextColors(),
                    themeUtils.getCardClass(),
                    themeUtils.getButtonRoundednessClass()
                  )}>
                  <Package size={18} />
                  <span className="text-sm">{countFor(category._id)}</span>
                </div>
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
            </div>
          ))}
          <div className="flex-shrink-0 w-4" />
        </div>
      </div>
    </div>
  );
}
