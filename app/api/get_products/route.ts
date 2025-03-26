/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getGoogleSheetsData } from '@/lib/CRUD';
import { productsConfig } from '@/constant';
import process from 'process';

type ProductName = keyof typeof productsConfig;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get('name') as ProductName | null;
  const fetchAll = searchParams.get('all') === 'true';

  try {
    const allDetails =
      (await getGoogleSheetsData(process.env.___SPREADSHEET_ID as string, 'PRODUCTS!A2:D')) || [];

    const detailsMap = allDetails.reduce((map: Record<string, any[]>, row) => {
      const [appName, typeAccess, duration, price] = row;

      if (!appName || !typeAccess || !duration || !price) return map;

      const configKey = `${appName.trim()}${typeAccess.trim()}`.replace(/\s+/g, '');

      if (!map[configKey]) map[configKey] = [];
      map[configKey].push({ duration, price });
      return map;
    }, {});

    const selectedProducts = fetchAll
      ? productsConfig
      : productName
      ? { [productName]: productsConfig[productName] }
      : {};

    if (Object.keys(selectedProducts).length === 0) {
      return NextResponse.json({ error: 'No valid product found' }, { status: 400 });
    }

    const productDataPromises = Object.entries(selectedProducts).map(async ([name, ranges]) => {
      const matchedDetails = detailsMap[name] || [];

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
        details: matchedDetails,
        stock: filteredAvailableData.length,
        expireDateColumnIndex: ranges.expireDateColumnIndex,
        totalColumns: ranges.totalColumns,
      };
    });

    const productsData = await Promise.all(productDataPromises);
    return NextResponse.json(productsData);
  } catch (error) {
    console.error('Error fetching products data:', error);
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
  }
}
