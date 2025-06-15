'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product, ThemeType } from '@/types';
import ProductCard from '../../shared/ProductCard';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { ArrowRight, LucideTicketPercent } from 'lucide-react';

interface DiscountedProductsProps {
  products: Product[];
  theme: ThemeType;
  onViewDetails?: (productId: string) => void;
  onNavigate: (page: string) => void;
}

export default function DiscountedProducts({
  products,
  theme,
  onViewDetails,
  onNavigate,
}: DiscountedProductsProps) {
  const themeUtils = useThemeUtils(theme || null);

  const discountedProducts = useMemo(() => {
    return products
      .filter((product) => product.discountPercentage > 0)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, 8);
  }, [products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'p-5 w-full space-y-5',
        themeUtils.getCardClass(),
        themeUtils.getComponentRoundednessClass(),
        themeUtils.getTextColors()
      )}>
      <div
        className={cn(
          'flex justify-between items-center w-full border-b pb-5 mb-5',
          themeUtils.getPrimaryColorClass('border')
        )}>
        <h2 className="lg:text-xl text-sm font-semibold flex gap-1">
          <LucideTicketPercent className="text-2xl" />
          ดีลส่วนลดสุดพิเศษ
        </h2>
        {discountedProducts.length > 0 && (
          <button
            onClick={() => onNavigate('products')}
            className={cn(
              'flex items-center gap-1 py-1 px-2 lg:text-sm text-xs  transition-colors',
              themeUtils.getPrimaryColorClass('bg'),
              themeUtils.getButtonClass(),
              themeUtils.getButtonRoundednessClass(),
              themeUtils.getPrimaryColorClass('border')
            )}>
            ดูเพิ่มเติม <ArrowRight size={16} />
          </button>
        )}
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        {discountedProducts.map((product) => (
          <motion.div key={product._id} variants={itemVariants}>
            <ProductCard
              product={product}
              theme={theme}
              role="buyer"
              category={product.category}
              onViewDetails={onViewDetails}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
