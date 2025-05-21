/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchStoreData } from '@/lib/fetchStoreData';
import { cn } from '@/lib/utils';

interface StorePageProps {
  params: { subdomain: string };
}

export async function generateMetadata({ params }: StorePageProps) {
  const { subdomain } = params;
  try {
    const { seller } = await fetchStoreData(subdomain);
    const storeName = seller?.store.name || 'Dokmai Store';
    const storeDescription = seller?.store.description || 'A digital product marketplace';
    return {
      title: storeName,
      description: storeDescription,
      openGraph: {
        title: storeName,
        description: storeDescription,
        url: `https://${seller?.username}.dokmai.store/`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Dokmai Store',
      description: 'A digital product marketplace',
    };
  }
}

// Page component
export default async function StorePage({ params }: StorePageProps) {
  const { subdomain } = params;
  const { theme, seller } = await fetchStoreData(subdomain);

  const storeName = seller?.store.name;
  const storeDescription = seller?.store.description;
  const primaryColor = theme?.primaryColor || 'inherit';

  return (
    <h2 style={{ color: primaryColor }} className={cn('font-bold text-2xl', 'text-light-200')}>
      Hi {storeName}
    </h2>
  );
}
