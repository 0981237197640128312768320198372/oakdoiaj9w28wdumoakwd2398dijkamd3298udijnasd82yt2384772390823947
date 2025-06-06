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
    <div className="space-y-8 w-full">
      <div
        className={cn(
          'flex justify-between items-center w-full border-b pb-5 ',
          themeUtils.getPrimaryColorClass('border')
        )}>
        <h2 className="lg:text-xl text-sm font-semibold flex gap-1">
          <AiOutlineProduct className="text-2xl" />
          แอพพรีเมียมที่มีขายในร้านเรา
        </h2>
        <button
          onClick={() => onNavigate('products')}
          className={cn(
            'flex items-center gap-1 py-1 px-2 lg:text-sm text-xs transition-colors',
            themeUtils.getPrimaryColorClass('bg'),
            themeUtils.getButtonClass(),
            themeUtils.getButtonRoundednessClass(),
            themeUtils.getPrimaryColorClass('border')
          )}>
          ดูเพิ่มเติม <ArrowRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-5">
        {categories.map((category) => (
          <div
            key={category._id}
            className={cn(
              'p-3 relative flex justify-center flex-col items-center gap-2',
              themeUtils.getCardClass(),
              themeUtils.getComponentRoundednessClass(),
              themeUtils.getComponentShadowClass()
            )}>
            {category.logoUrl ? (
              <Image
                src={category.logoUrl}
                alt={category.name}
                width={100}
                height={100}
                className="w-auto h-auto max-w-full"
              />
            ) : (
              <div className="h-24 w-full bg-gray-200 flex items-center justify-center">
                {category.name}
              </div>
            )}{' '}
            <div
              className={cn(
                'absolute -top-4 -left-2 p-1 px-1.5 text-sm font-bold flex items-center gap-1',
                themeUtils.getTextColors(),
                themeUtils.getCardClass(),
                themeUtils.getButtonRoundednessClass()
              )}>
              <Package size={12} /> {countFor(category._id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
