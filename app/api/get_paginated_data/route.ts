/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsData } from '@/lib/CRUD';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.NEXT_API_KEY;

  if (apiKey !== validApiKey) {
    return NextResponse.json('Unauthorized: Invalid API key', {
      status: 401,
    });
  }

  const { searchParams } = new URL(req.url);
  const sheetName = searchParams.get('sheet') || '';
  const range = searchParams.get('range') || '';
  const limit = parseInt(searchParams.get('limit') || '0', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const columnsParam = searchParams.get('columns');

  let columns = columnsParam ? columnsParam.split(',') : null;

  if (columns !== null && columns.some((col) => !/^[A-Z]+$/.test(col))) {
    return NextResponse.json({ error: 'Invalid columns format' }, { status: 400 });
  }
  try {
    const data = await getGoogleSheetsData(
      process.env.WORK_WORK_WORK_WORK_SPREADSHEET_ID as string,
      `${sheetName}!${range}`
    );

    let processedData = data || [];

    if (columns) {
      processedData = processedData.map((row) =>
        columns.map((col) => {
          const colIndex = col.charCodeAt(0) - 65;
          return row[colIndex];
        })
      );
    }

    const totalRows = processedData.length;

    if (limit > 0) {
      processedData = processedData.slice(offset, offset + limit);
    }

    return NextResponse.json(
      {
        data: processedData,
        totalRows: totalRows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reading data', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
