/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleSheetsData } from '@/lib/CRUD';

// Define the list of sheets to check
const sheetsToCheck = Array.from({ length: 10 }, (_, i) => `READY_TO_USE_${i + 1}`);

export async function GET(req: NextRequest) {
  try {
    // Validate environment variable
    if (!process.env.BOT_WORKSPACE_SPREADSHEET_ID) {
      return NextResponse.json(
        { error: 'BOT_WORKSPACE_SPREADSHEET_ID is not defined in environment variables' },
        { status: 500 }
      );
    }

    const spreadsheetId = process.env.BOT_WORKSPACE_SPREADSHEET_ID;

    // Fetch data for each sheet and calculate lengths
    const sheetLengths: { [key: string]: number } = {};

    for (const sheetName of sheetsToCheck) {
      try {
        // Fetch data for the sheet (assuming a range that covers all rows, e.g., 'A:Z')
        const data = await getGoogleSheetsData(spreadsheetId, `${sheetName}!A:Z`);
        // The length of the data array is the number of rows
        sheetLengths[sheetName] = data.length;
      } catch (error) {
        console.error(`Error fetching data for sheet ${sheetName}:`, error);
        sheetLengths[sheetName] = 0; // Set length to 0 if the sheet fails to load
      }
    }

    return NextResponse.json({
      message: 'Sheet lengths retrieved successfully',
      sheetLengths,
    });
  } catch (error) {
    console.error('Error retrieving sheet lengths:', error);
    return NextResponse.json({ error: 'Failed to retrieve sheet lengths' }, { status: 500 });
  }
}
