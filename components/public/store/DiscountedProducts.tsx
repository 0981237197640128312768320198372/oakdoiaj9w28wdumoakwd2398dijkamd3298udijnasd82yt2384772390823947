'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product, ThemeType } from '@/types';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { ArrowRight } from 'lucide-react';

interface DiscountedProductsProps {
  products: Product[];
  theme: ThemeType;
  onNavigate?: (page: string) => void;
}

export default function DiscountedProducts({
  products,
  theme,
  onNavigate,
}: DiscountedProductsProps) {
  const themeUtils = useThemeUtils(theme || null);

  // Filter products with discounts and sort by discount percentage (highest first)
  const discountedProducts = useMemo(() => {
    return products
      .filter((product) => product.discountPercentage > 0)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)
      .slice(0, 10); // Take only the top 10 products with highest discounts
  }, [products]);

  // Animation variants
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

  // If there are no discounted products, don't render the component
  if (discountedProducts.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'rounded-xl p-5 space-y-4',
        themeUtils.getCardClass(),
        themeUtils.getTextColors()
      )}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hot Deals</h2>
        {discountedProducts.length > 0 && (
          <button
            onClick={() => onNavigate && onNavigate('products')}
            className={cn(
              'flex items-center gap-1 text-sm transition-colors',
              themeUtils.getPrimaryColorClass('text'),
              'hover:' + themeUtils.getPrimaryColorClass('text') + '/80'
            )}>
            See more <ArrowRight size={16} />
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
              category={product.category}
              onBuyNow={(productId) => {
                console.log(`Buy now clicked for product: ${productId}`);
                // In a real implementation, this would handle the purchase flow
                // or redirect to a product detail page
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
