'use client';

import { Product, ThemeType } from '@/types';
import DiscountedProducts from './DiscountedProducts';
import RecommendedForYou from './RecommendedForYou';

interface ProductShowcaseProps {
  products: Product[];
  theme: ThemeType;
  sellerId?: string;
  onViewDetails?: (productId: string) => void;
  onNavigate: (page: string) => void;
}

export default function ProductShowcase({
  products,
  theme,
  sellerId,
  onViewDetails,
  onNavigate,
}: ProductShowcaseProps) {
  // Check if there are any discounted products
  const hasDiscountedProducts = products.some((product) => product.discountPercentage > 0);

  return (
    <div className="space-y-6">
      {/* Always show discounted products if available */}
      <DiscountedProducts
        products={products}
        theme={theme}
        onViewDetails={onViewDetails}
        onNavigate={onNavigate}
      />

      {/* Show RecommendedForYou when there are no discounted products OR as additional content */}
      {!hasDiscountedProducts && (
        <RecommendedForYou
          products={products}
          theme={theme}
          sellerId={sellerId}
          onViewDetails={onViewDetails}
          onNavigate={onNavigate}
          maxProducts={8}
        />
      )}
    </div>
  );
}
