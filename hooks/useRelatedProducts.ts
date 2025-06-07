/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Product } from '@/types';

export const useRelatedProducts = (
  currentProductId: string,
  categoryId: string,
  currentPrice: number,
  sellerId?: string
) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProductId) {
        // console.log('Missing required parameter: currentProductId');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First try to get products by category
        const storeParam = sellerId ? `&store=${sellerId}` : '';
        let relatedByCategory: Product[] = [];

        if (categoryId) {
          // console.log(`Fetching related products for category: ${categoryId}`);
          const categoryResponse = await fetch(
            `/api/v3/products?categoryId=${categoryId}${storeParam}`
          );

          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            // console.log('Category API response:', categoryData);

            // Filter out the current product
            relatedByCategory = categoryData.products.filter(
              (product: Product) => product._id !== currentProductId
            );

            // console.log('Related products by category:', relatedByCategory);
          }
        }

        // If we have enough category-related products, use those
        if (relatedByCategory.length >= 2) {
          setRelatedProducts(relatedByCategory.slice(0, 4));
        }
        // Otherwise, fetch products with similar price
        else {
          // console.log(`Fetching products with similar price to: ${currentPrice}`);

          // Fetch all products
          const allProductsResponse = await fetch(
            `/api/v3/products${storeParam ? `?${storeParam.substring(1)}` : ''}`
          );

          if (allProductsResponse.ok) {
            const allProductsData = await allProductsResponse.json();
            // console.log('All products API response:', allProductsData);

            // Filter out the current product and sort by price similarity
            const productsBySimilarPrice = allProductsData.products
              .filter((product: Product) => product._id !== currentProductId)
              .sort((a: Product, b: Product) => {
                const aPriceDiff = Math.abs(a.price - currentPrice);
                const bPriceDiff = Math.abs(b.price - currentPrice);
                return aPriceDiff - bPriceDiff;
              });

            // console.log('Products sorted by price similarity:', productsBySimilarPrice);

            // Combine category products with price-similar products
            const combinedProducts = [...relatedByCategory];

            // Add price-similar products that aren't already in the list
            for (const product of productsBySimilarPrice) {
              if (!combinedProducts.some((p) => p._id === product._id)) {
                combinedProducts.push(product);
                if (combinedProducts.length >= 4) break;
              }
            }

            setRelatedProducts(combinedProducts.slice(0, 4));
          } else {
            console.error('Failed to fetch all products:', allProductsResponse.statusText);
            // If we have some category products, use those even if fewer than 4
            if (relatedByCategory.length > 0) {
              setRelatedProducts(relatedByCategory);
            } else {
              setError('Failed to fetch related products');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId, currentPrice, sellerId]);

  return { relatedProducts, isLoading, error };
};

export default useRelatedProducts;
