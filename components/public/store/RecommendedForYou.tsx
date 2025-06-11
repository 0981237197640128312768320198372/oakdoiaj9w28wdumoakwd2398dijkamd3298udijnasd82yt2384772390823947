'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Product, ThemeType } from '@/types';
import ProductCard from '../../shared/ProductCard';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { ArrowRight, Sparkles } from 'lucide-react';

interface RecommendedForYouProps {
  products: Product[];
  theme: ThemeType;
  sellerId?: string;
  onViewDetails?: (productId: string) => void;
  onNavigate: (page: string) => void;
  maxProducts?: number;
}

export default function RecommendedForYou({
  products,
  theme,
  sellerId = '',
  onViewDetails,
  onNavigate,
  maxProducts = 8,
}: RecommendedForYouProps) {
  const themeUtils = useThemeUtils(theme || null);

  // Smart recommendation algorithm
  const recommendedProducts = useMemo(() => {
    if (products.length === 0) return [];

    // Create daily seed for consistent but changing recommendations
    const today = new Date().toDateString();
    const dailySeed = hashString(today + sellerId);

    // Score each product based on multiple factors
    // Include all active products, even those with zero stock
    const scoredProducts = products
      .filter((product) => product.status === 'active')
      .map((product) => {
        let score = 0;

        // Recency Score (30%) - newer products get higher scores
        const createdDate = new Date(product.createdAt);
        const daysSinceCreated = Math.max(
          1,
          Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        const recencyScore = Math.max(0, 100 - daysSinceCreated * 2); // Decreases over time
        score += recencyScore * 0.3;

        // Rating Score (25%) - products with better ratings score higher
        const rating = parseFloat(product.rating || '0');
        const ratingScore = rating * 20; // 0-5 rating becomes 0-100 score
        score += ratingScore * 0.25;

        // Stock Availability Score (15%) - prioritize in-stock items but don't exclude out-of-stock
        const stock = product._stock || 0;
        let stockScore;
        if (stock > 0) {
          stockScore = Math.min(100, stock * 5); // In-stock items get full scoring
        } else {
          stockScore = 20; // Out-of-stock items get base score to still appear
        }
        score += stockScore * 0.15;

        // Price Attractiveness Score (10%) - reasonably priced items
        const priceScore = Math.max(0, 100 - product.price / 100); // Lower prices get higher scores
        score += Math.min(100, priceScore) * 0.1;

        // Daily Randomization (20%) - controlled randomness that changes daily
        const productSeed = hashString(product._id + dailySeed.toString());
        const randomScore = productSeed % 100;
        score += randomScore * 0.2;

        return { product, score };
      });

    // Sort by score and ensure category diversity
    const sortedProducts = scoredProducts.sort((a, b) => b.score - a.score);

    // Apply category diversity - limit products per category
    const categoryCount: { [key: string]: number } = {};
    const maxPerCategory = Math.max(2, Math.floor(maxProducts / 3));

    const diversifiedProducts = sortedProducts.filter(({ product }) => {
      const categoryId = product.categoryId || 'uncategorized';
      const currentCount = categoryCount[categoryId] || 0;

      if (currentCount < maxPerCategory) {
        categoryCount[categoryId] = currentCount + 1;
        return true;
      }
      return false;
    });

    // Shuffle the final selection with daily seed for variety
    const finalProducts = shuffleArrayWithSeed(diversifiedProducts, dailySeed)
      .slice(0, maxProducts)
      .map(({ product }) => product);

    return finalProducts;
  }, [products, sellerId, maxProducts]);

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

  if (recommendedProducts.length === 0) {
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
        <h2 className="lg:text-xl text-sm font-semibold flex gap-2 items-center">
          <Sparkles className="text-2xl animate-pulse" />
          แนะนำสำหรับคุณ
        </h2>
        {recommendedProducts.length > 0 && (
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
        )}
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        {recommendedProducts.map((product) => (
          <motion.div key={product._id} variants={itemVariants}>
            <ProductCard
              product={product}
              theme={theme}
              role="buyer"
              category={product.category}
              onViewDetails={onViewDetails}
              onBuyNow={(productId) => {
                console.log(`ซื้อเลย clicked for product: ${productId}`);
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

// Utility function to create a hash from string (simple implementation)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Utility function to shuffle array with seed for consistent randomization
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Simple linear congruential generator for seeded randomness
    currentSeed = (currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
    const randomIndex = Math.floor((currentSeed / Math.pow(2, 32)) * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}
