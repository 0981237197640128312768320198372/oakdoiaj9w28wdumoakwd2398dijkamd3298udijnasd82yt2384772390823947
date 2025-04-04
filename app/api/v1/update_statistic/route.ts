/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Set up Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME || '';
const fileName = 'statistics.json';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      time,
      date,
      depositAmount = 0,
      spentAmount = 0,
      productsSold = 0,
      userLogins = 0,
    } = body;

    if (!time || !date) {
      return NextResponse.json({ error: "Missing 'time' or 'date' parameter" }, { status: 400 });
    }

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    let data = exists
      ? JSON.parse((await file.download())[0].toString())
      : { daily: {}, monthly: {} };

    if (!data.daily[date]) {
      data.daily[date] = [];
    }

    const existingIndex = data.daily[date].findIndex(
      (entry: { time: string }) => entry.time === time
    );

    if (existingIndex !== -1) {
      const existingEntry = data.daily[date][existingIndex];
      data.daily[date][existingIndex] = {
        ...existingEntry,
        depositAmount: existingEntry.depositAmount + depositAmount,
        spentAmount: existingEntry.spentAmount + spentAmount,
        productsSold: existingEntry.productsSold + productsSold,
        userLogins: existingEntry.userLogins + userLogins,
      };
    } else {
      data.daily[date].push({
        time,
        depositAmount,
        spentAmount,
        productsSold,
        userLogins,
      });
    }

    const dailyTotals = data.daily[date].reduce(
      (
        totals: {
          depositAmount: number;
          spentAmount: number;
          productsSold: number;
          userLogins: number;
        },
        entry: {
          depositAmount: number;
          spentAmount: number;
          productsSold: number;
          userLogins: number;
        }
      ) => {
        totals.depositAmount += entry.depositAmount || 0;
        totals.spentAmount += entry.spentAmount || 0;
        totals.productsSold += entry.productsSold || 0;
        totals.userLogins += entry.userLogins || 0;
        return totals;
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    );

    const month = date.slice(0, 7);
    if (!data.monthly[month]) {
      data.monthly[month] = [];
    }

    const dayIndex = data.monthly[month].findIndex(
      (entry: { date: string }) => entry.date === date
    );
    if (dayIndex !== -1) {
      data.monthly[month][dayIndex] = { date, ...dailyTotals };
    } else {
      data.monthly[month].push({ date, ...dailyTotals });
    }

    await file.save(JSON.stringify(data, null, 2), {
      contentType: 'application/json',
    });

    return NextResponse.json({ message: 'Statistics updated successfully' });
  } catch (error) {
    console.error('Error updating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to update statistics', details: error },
      { status: 500 }
    );
  }
}
