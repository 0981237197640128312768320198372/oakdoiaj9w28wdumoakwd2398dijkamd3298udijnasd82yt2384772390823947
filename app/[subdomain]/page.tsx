import { fetchStoreData } from '@/lib/fetchStoreData';
import { cn } from '@/lib/utils';

interface StorePageProps {
  params: { subdomain: string };
}

export default async function StorePage({ params }: StorePageProps) {
  const { subdomain } = params;
  console.log(subdomain);
  const { theme, seller } = await fetchStoreData(subdomain);

  const storeName = seller?.store.name;
  const primaryColor = theme?.primaryColor || 'inherit';

  return (
    <h2 style={{ color: primaryColor }} className={cn('font-bold text-2xl', 'text-light-200')}>
      Hi {storeName}
    </h2>
  );
}
