/* eslint-disable @typescript-eslint/no-explicit-any */
import { getGoogleSheetsData, getGoogleSheetsInstance } from '@/lib/CRUD';
import { NextRequest, NextResponse } from 'next/server';

function columnLetterToIndex(letter: string) {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1; // Make it 0-based
}

function indexToColumnLetter(index: number) {
  let letter = '';
  let tempIndex = index + 1;
  while (tempIndex > 0) {
    const remainder = (tempIndex - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    tempIndex = Math.floor((tempIndex - 1) / 26);
  }
  return letter;
}

const rangeModels: {
  [appName: string]: {
    [accessType: string]: { range: string; orderDateColumn: string };
  };
} = {
  'Netflix Premium': {
    'Family Access (Seller Price)': {
      range: 'RESELLERFamilyAccess!A12:E',
      orderDateColumn: 'E',
    },
    'Sharing Access With TV (Seller Price)': {
      range: 'RESELLERSharingWithTV!A12:G',
      orderDateColumn: 'G',
    },
    'Sharing Access No TV (Seller Price)': {
      range: 'RESELLERSharingNoTV!A12:G',
      orderDateColumn: 'G',
    },
    'Family Access': {
      range: 'FamilyAccess!A12:E',
      orderDateColumn: 'E',
    },
    'Sharing Access With TV': {
      range: 'SharingWithTV!A12:G',
      orderDateColumn: 'G',
    },
    'Sharing Access No TV': {
      range: 'SharingNoTV!A12:G',
      orderDateColumn: 'G',
    },
  },
  'Prime Video': {
    'Sharing Access': {
      range: 'PrimeVideoSharing!A12:F',
      orderDateColumn: 'F',
    },
    'Family Access': {
      range: 'PrimeVideoFamily!A12:E',
      orderDateColumn: 'E',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { personalKey, appName, accessType, Email, Password, orderDate, problem } =
      await req.json();

    if (!personalKey || !appName || !accessType || !Email || !Password || !orderDate || !problem) {
      return NextResponse.json({ error: 'All parameters are required' }, { status: 400 });
    }

    const config = rangeModels[appName]?.[accessType];
    if (!config) {
      return NextResponse.json({ error: 'Invalid appName or accessType' }, { status: 400 });
    }
    const { range, orderDateColumn } = config;
    const [sheetName, rangePart] = range.split('!');

    const sheetData = await getGoogleSheetsData(process.env.___SPREADSHEET_ID as string, range);

    const orderDateIndex = columnLetterToIndex(orderDateColumn);
    const matchingRowIndex = sheetData.findIndex((row: string[]) => {
      return (
        row[0] === personalKey &&
        row[1] === Email &&
        row[2] === Password &&
        row[orderDateIndex] === orderDate
      );
    });

    if (matchingRowIndex === -1) {
      return NextResponse.json({ error: 'No matching row found' }, { status: 404 });
    }

    const problemIndex = orderDateIndex + 4;
    const problemColumnLetter = indexToColumnLetter(problemIndex);

    const startRow = parseInt(rangePart.split(':')[0].slice(1));
    const actualRowNumber = startRow + matchingRowIndex;

    const problemRange = `${sheetName}!${problemColumnLetter}${actualRowNumber}`;
    const sheets = await getGoogleSheetsInstance();
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.___SPREADSHEET_ID,
      range: problemRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[problem]],
      },
    });

    return NextResponse.json({ message: 'Problem reported successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error reporting problem:', error);
    return NextResponse.json({ error: 'Failed to report problem' }, { status: 500 });
  }
}
