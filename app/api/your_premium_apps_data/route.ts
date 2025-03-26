/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsData } from '@/lib/CRUD';
import { sheetConfig } from '@/constant';

export async function POST(req: NextRequest) {
  const { personalKey } = await req.json();

  if (!personalKey) {
    return NextResponse.json({ error: 'Personal key is required' }, { status: 400 });
  }

  try {
    if (!process.env.___SPREADSHEET_ID) {
      throw new Error('Spreadsheet ID is not defined in environment variables');
    }
    const sheetDataPromises = sheetConfig.map((config) =>
      getGoogleSheetsData(process.env.___SPREADSHEET_ID as string, config.range)
    );
    const sheetDataArray = await Promise.all(sheetDataPromises);

    const consolidatedData = sheetConfig.flatMap((config, index) => {
      const sheetData = sheetDataArray[index] || [];
      return sheetData
        .filter((row: string[]) => row[0] === personalKey)
        .map((row: string[]) => {
          const formattedRow: Record<string, string> = {
            appName: config.appName,
            accessType: config.accessType,
          };
          config.columns.forEach((label, colIndex) => {
            formattedRow[label] = row[colIndex + 1];
          });
          return formattedRow;
        });
    });

    if (consolidatedData.length === 0) {
      return NextResponse.json(
        { error: 'No premium data found for this Personal Key' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: consolidatedData }, { status: 200 });
  } catch (error) {
    console.error('Error reading data', error);
    return NextResponse.json({ error: 'Failed to fetch premium apps data' }, { status: 500 });
  }
}
