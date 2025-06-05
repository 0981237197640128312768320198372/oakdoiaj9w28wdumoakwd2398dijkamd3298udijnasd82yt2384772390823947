/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Product } from '@/types';

export const useRelatedProducts = (
  currentProductId: string,
  categoryId: string,
  sellerId?: string
) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId || !currentProductId) {
        console.log('Missing required parameters:', { categoryId, currentProductId });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use relative URL to avoid CORS issues
        const storeParam = sellerId ? `&store=${sellerId}` : '';
        console.log(
          `Fetching related products for category: ${categoryId}, excluding product: ${currentProductId}`
        );

        const response = await fetch(`/api/v3/products?categoryId=${categoryId}${storeParam}`);

        if (response.ok) {
          const data = await response.json();
          console.log('API response:', data);

          // Filter out the current product and limit to 4 related products
          const filtered = data.products
            .filter((product: Product) => product._id !== currentProductId)
            .slice(0, 4);

          console.log('Filtered related products:', filtered);
          setRelatedProducts(filtered);
        } else {
          console.error('Failed to fetch related products:', response.statusText);
          setError('Failed to fetch related products');
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId, sellerId]);

  return { relatedProducts, isLoading, error };
};

export default useRelatedProducts;
