// app/[subdomain]/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import PublicStoreLayout from '@/components/seller/public/PublicStoreLayout';
import PublicStoreProfile from '@/components/seller/public/PublicStoreProfile';
import StoreProducts from '@/components/seller/public/StoreProducts';
import { fetchStoreData } from '@/lib/fetchStoreData';
import { cn, generateMetadata as generateMetadataUtil } from '@/lib/utils';
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
    // console.error('Error generating metadata:', error);
  }
}

export default async function StorePage(props: StorePageProps) {
  const { subdomain } = await props.params;
  try {
    const { theme, seller } = await fetchStoreData(subdomain);

    if (!seller) {
      notFound();
    }

    // Fetch products and categories here
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';
    const response = await fetch(`${API_URL}/api/v3/products?store=${seller.username}`);
    const data = await response.json();
    const products = data.products;

    // Extract unique categories from the products
    const categories = [...new Set(products.map((product: any) => product.type))].map(
      (categoryName) => ({
        _id: categoryName,
        name: categoryName,
      })
    );

    return (
      <PublicStoreLayout theme={theme} seller={seller}>
        <PublicStoreProfile seller={seller} products={products} categories={categories} />
        <StoreProducts store={seller.username} />
      </PublicStoreLayout>
    );
  } catch (error) {
    notFound();
  }
}
