/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getGoogleSheetsData } from '@/lib/CRUD';
import { productsConfig } from '@/constant';
import process from 'process';

export async function GET(request: Request) {
  const validApiKey = process.env.SECURE_API_KEY;
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== validApiKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all product details from Google Sheets
    const allDetails =
      (await getGoogleSheetsData(process.env.___SPREADSHEET_ID as string, 'PRODUCTS!A2:D')) || [];

    // Transform details to map with productConfig keys
    const detailsMap = allDetails.reduce((map: Record<string, any[]>, row) => {
      const [appName, typeAccess, duration, price] = row;

      if (!appName || !typeAccess || !duration || !price) return map; // Skip invalid rows

      const configKey = `${appName.trim()}${typeAccess.trim()}`.replace(/\s+/g, '');

      if (!map[configKey]) map[configKey] = [];
      map[configKey].push({ duration, price });
      return map;
    }, {});

    const productDataPromises = Object.entries(productsConfig).map(async ([name, ranges]) => {
      const availableData = await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        ranges.availableDataRange
      );

      const normalizedAvailableData = (availableData || []).map((row: any[]) => {
        while (row.length < ranges.totalColumns) {
          row.push('');
        }
        return row;
      });

      const filteredAvailableData = normalizedAvailableData
        .map((row: any[], index: number) => ({
          data: row,
          row: index + 12,
        }))
        .filter((item) => item.data[0] === '' && item.data[ranges.expireDateColumnIndex] === '');

      return {
        name,
        details: detailsMap[name] || [],
        stock: filteredAvailableData.length,
        availableAccounts: filteredAvailableData,
        expireDateColumnIndex: ranges.expireDateColumnIndex,
        totalColumns: ranges.totalColumns,
      };
    });

    const productsData = await Promise.all(productDataPromises);
    return NextResponse.json(productsData);
  } catch (error) {
    console.error('Error fetching secure product data:', error);
    return NextResponse.json({ error: 'Failed to fetch secure product data' }, { status: 500 });
  }
}
