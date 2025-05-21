/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchStoreData } from '@/lib/fetchStoreData';
import { cn, generateMetadata as generateMetadataUtil } from '@/lib/utils';

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
    const storeName = seller?.store.name || 'Dokmai Store';
    const storeDescription = seller?.store.description || 'A digital product marketplace';
    const url = `https://${seller?.username}.dokmai.store/`;

    return generateMetadataUtil({
      title: storeName,
      description: storeDescription,
      url,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);

    return generateMetadataUtil({
      title: 'Dokmai Store',
      description: 'A digital product marketplace',
      url: 'https://dokmai.store',
    });
  }
}

export default async function StorePage(props: StorePageProps) {
  const { subdomain } = await props.params;
  const { theme, seller } = await fetchStoreData(subdomain);

  const storeName = seller?.store.name;
  const primaryColor = theme?.primaryColor || 'inherit';

  return (
    <h2 style={{ color: primaryColor }} className={cn('font-bold text-2xl', 'text-light-200')}>
      Hi {storeName}
    </h2>
  );
}
