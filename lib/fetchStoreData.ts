/* eslint-disable @typescript-eslint/no-explicit-any */
interface StoreData {
  theme: any;
  seller: any;
}

export async function fetchStoreData(subdomain: string): Promise<StoreData> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dokmaistore.com';

  // Validate subdomain before making API calls
  if (!subdomain || subdomain.trim() === '') {
    throw new Error('Invalid subdomain provided');
  }

  try {
    console.log(`Fetching store data for subdomain: ${subdomain}`);

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

    console.log(`Theme API response status: ${themeResponse.status}`);
    console.log(`Seller API response status: ${sellerResponse.status}`);

    if (!themeResponse.ok || !sellerResponse.ok) {
      const themeError = !themeResponse.ok ? `Theme API: ${themeResponse.status}` : '';
      const sellerError = !sellerResponse.ok ? `Seller API: ${sellerResponse.status}` : '';
      const errorMessage = `Failed to fetch data - ${themeError} ${sellerError}`.trim();
      throw new Error(errorMessage);
    }

    const themeData = await themeResponse.json();
    const sellerData = await sellerResponse.json();

    return {
      theme: themeData,
      seller: sellerData.seller,
    };
  } catch (error) {
    console.error(`Error fetching store data for subdomain "${subdomain}":`, error);
    throw error;
  }
}
