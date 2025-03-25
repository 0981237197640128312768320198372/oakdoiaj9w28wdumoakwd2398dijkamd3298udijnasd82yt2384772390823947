import { NextResponse } from 'next/server';
import { getGoogleSheetsData, updateUserField } from '@/app/api/CRUD';
import process from 'process';
import { updateStatistic } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { personalKey, totalDepositAmount, depositAmount } = await request.json();

    if (!personalKey || !totalDepositAmount || totalDepositAmount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid input. Personal Key and a positive deposit amount are required.',
        },
        { status: 400 }
      );
    }

    const userInfoSheetRange = 'UserInfo!A2:D';

    const userData =
      (await getGoogleSheetsData(
        process.env.___SPREADSHEET_ID as string,
        userInfoSheetRange,
        'third'
      )) || [];

    const userRow = userData.findIndex((row) => row[0] === personalKey);

    if (userRow === -1) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const currentBalance = parseFloat(userData[userRow][1]);

    const newBalance = currentBalance + totalDepositAmount;

    await updateUserField(
      process.env.___SPREADSHEET_ID as string,
      'UserInfo',
      'A',
      personalKey,
      'B',
      newBalance.toString()
    );

    await updateStatistic('depositAmount', Number(depositAmount));
    return NextResponse.json({
      message: 'Balance deposited successfully',
      newBalance,
    });
  } catch (error) {
    console.error('Error depositing balance:', error);
    return NextResponse.json({ error: 'Failed to deposit balance' }, { status: 500 });
  }
}
