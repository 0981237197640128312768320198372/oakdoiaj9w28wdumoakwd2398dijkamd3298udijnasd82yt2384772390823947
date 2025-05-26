/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicStoreLayout from '@/components/seller/public/PublicStoreLayout';
import PublicStoreProfile from '@/components/seller/public/PublicStoreProfile';
import StoreProducts from '@/components/seller/public/StoreProducts';
import { fetchStoreData } from '@/lib/fetchStoreData';
import { generateMetadata as generateMetadataUtil } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface ResolvedParams {
  subdomain: string;
}

interface StorePageProps {
  params: Promise<ResolvedParams>;
}

export async function generateMetadata(props: StorePageProps) {
  const { subdomain } = await props.params;
  try {
    const { seller } = await fetchStoreData(subdomain);
    const storeLogo = seller?.store?.logoUrl || 'Dokmai Store';
    const storeName = seller?.store.name;
    const storeDescription = seller?.store.description;
    const url = `https://${seller?.username}.dokmai.store/`;

    return generateMetadataUtil({
      title: storeName,
      description: storeDescription,
      url,
      iconUrl: storeLogo,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateMetadataUtil({
      title: 'Store Name',
      description: 'Welcome to our store',
      url: `https://${subdomain}.dokmai.store/`,
    });
  }
}

export default async function StorePage(props: StorePageProps) {
  const { subdomain } = await props.params;
  try {
    const { theme, seller } = await fetchStoreData(subdomain);

    if (!seller) {
      notFound();
    }

    let products = [];
    let categories = [];

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';
      const productsResponse = await fetch(`${API_URL}/api/v3/products?store=${seller.username}`, {
        cache: 'no-store',
      });

      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products');
      }

      const productsData = await productsResponse.json();
      products = productsData.products || [];

      if (products.length > 0) {
        const categoryIds = [...new Set(products.map((product: any) => product.categoryId))];
        const categoriesPromises = categoryIds.map(async (categoryId) => {
          const categoryResponse = await fetch(`${API_URL}/api/v3/categories?id=${categoryId}`, {
            cache: 'no-store',
          });
          if (!categoryResponse.ok) {
            console.error(`Failed to fetch category with ID: ${categoryId}`);
            return null;
          }
          return await categoryResponse.json();
        });

        const categoriesResults = await Promise.all(categoriesPromises);
        categories = categoriesResults.filter(Boolean).map((result) => result.category);
      }
    } catch (error) {
      console.error('Error fetching products or categories:', error);

      products = getMockProducts();
      categories = getMockCategories();
    }

    return (
      <PublicStoreLayout theme={theme} seller={seller} products={products} categories={categories}>
        <PublicStoreProfile seller={seller} products={products} categories={categories} />
        <StoreProducts store={seller.username} />
      </PublicStoreLayout>
    );
  } catch (error) {
    console.error('Store page error:', error);
    notFound();
  }
}

// Mock data functions for development
function getMockProducts() {
  return Array(10)
    .fill(null)
    .map((_, i) => ({
      id: `product-${i}`,
      name: `Product ${i + 1}`,
      description: 'This is a sample product description.',
      price: Math.floor(Math.random() * 100) + 10,
      imageUrl: `/placeholder.svg?height=300&width=300&query=product ${i + 1}`,
      categoryId: `category-${Math.floor(i / 3) + 1}`,
    }));
}

function getMockCategories() {
  return [
    {
      id: 'category-1',
      name: 'Electronics',
      image: '/placeholder.svg?height=48&width=48&query=electronics',
      title: 'Electronics',
      subtitle: 'Gadgets and devices',
    },
    {
      id: 'category-2',
      name: 'Clothing',
      image: '/placeholder.svg?height=48&width=48&query=clothing',
      title: 'Clothing',
      subtitle: 'Fashion items',
    },
    {
      id: 'category-3',
      name: 'Home',
      image: '/placeholder.svg?height=48&width=48&query=home',
      title: 'Home',
      subtitle: 'Home decor and furniture',
    },
    {
      id: 'category-4',
      name: 'Beauty',
      image: '/placeholder.svg?height=48&width=48&query=beauty',
      title: 'Beauty',
      subtitle: 'Cosmetics and skincare',
    },
  ];
}
