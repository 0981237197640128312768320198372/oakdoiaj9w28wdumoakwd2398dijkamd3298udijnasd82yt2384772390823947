/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicStoreLayout from '@/components/public/store/PublicStoreLayout';
import PublicStoreProfile from '@/components/public/store/PublicStoreProfile';
import StoreProducts from '@/components/public/store/StoreProducts';
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

  const invalidSubdomains = [
    'favicon',
    'www',
    'seller',
    'admin',
    'api',
    'static',
    'assets',
    'manifest',
    'robots',
    'sitemap',
  ];
  if (
    invalidSubdomains.includes(subdomain) ||
    subdomain.includes('favicon') ||
    subdomain.includes('.ico')
  ) {
    return generateMetadataUtil({
      title: 'Dokmai Store',
      description: 'Welcome to Dokmai Store',
      url: 'https://dokmai.store/',
    });
  }

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
      title: 'ชื่อร้าน',
      description: 'Welcome to our store',
      url: `https://${subdomain}.dokmai.store/`,
    });
  }
}

export default async function StorePage(props: StorePageProps) {
  const { subdomain } = await props.params;

  // Check for invalid subdomains and return 404
  const invalidSubdomains = [
    'favicon',
    'www',
    'seller',
    'admin',
    'api',
    'static',
    'assets',
    'manifest',
    'robots',
    'sitemap',
  ];
  if (
    invalidSubdomains.includes(subdomain) ||
    subdomain.includes('favicon') ||
    subdomain.includes('.ico')
  ) {
    notFound();
  }

  try {
    const { theme, seller } = await fetchStoreData(subdomain);

    if (!seller) {
      notFound();
    }

    let products = [];
    let categories = [];

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
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

        // Batch fetch categories in a single API call
        if (categoryIds.length > 0) {
          const categoryResponse = await fetch(
            `${API_URL}/api/v3/categories?ids=${categoryIds.join(',')}`,
            {
              cache: 'no-store',
            }
          );

          if (categoryResponse.ok) {
            const categoriesData = await categoryResponse.json();
            categories = categoriesData.categories || [];
          } else {
            console.error('Failed to fetch categories');
            categories = [];
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products or categories:', error);

      products = [];
      categories = [];
    }

    return (
      <PublicStoreLayout theme={theme} seller={seller} products={products} categories={categories}>
        <PublicStoreProfile theme={theme} seller={seller} />
        <StoreProducts theme={theme} store={seller.username} />
      </PublicStoreLayout>
    );
  } catch (error) {
    console.error('Store page error:', error);
    notFound();
  }
}
