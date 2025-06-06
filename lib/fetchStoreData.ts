/* eslint-disable @typescript-eslint/no-explicit-any */
interface StoreData {
  theme: any;
  seller: any;
}

export async function fetchStoreData(subdomain: string): Promise<StoreData> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';
  try {
    const [themeResponse, sellerResponse] = await Promise.all([
      fetch(`${API_URL}/api/v3/seller/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: subdomain }),
      }),
      fetch(`${API_URL}/api/v3/seller/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: subdomain }),
      }),
    ]);

    if (!themeResponse.ok || !sellerResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const themeData = await themeResponse.json();
    const sellerData = await sellerResponse.json();

    return {
      theme: themeData,
      seller: sellerData.seller,
    };
  } catch (error) {
    // console.error('Error fetching store data:', error);
    throw error;
  }
}
