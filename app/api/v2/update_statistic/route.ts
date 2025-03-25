/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DailyStatistics from '@/models/DailyStatistics';
import MonthlyStatistics from '@/models/MonthlyStatistics';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
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

    // Update daily statistics
    let dailyDoc = await DailyStatistics.findOne({ date });
    if (!dailyDoc) {
      dailyDoc = new DailyStatistics({ date, entries: [] });
    }

    const existingEntryIndex = dailyDoc.entries.findIndex((entry: any) => entry.time === time);
    if (existingEntryIndex !== -1) {
      dailyDoc.entries[existingEntryIndex].depositAmount += depositAmount;
      dailyDoc.entries[existingEntryIndex].spentAmount += spentAmount;
      dailyDoc.entries[existingEntryIndex].productsSold += productsSold;
      dailyDoc.entries[existingEntryIndex].userLogins += userLogins;
    } else {
      dailyDoc.entries.push({
        time,
        depositAmount,
        spentAmount,
        productsSold,
        userLogins,
      });
    }
    await dailyDoc.save();

    // Calculate daily totals
    const dailyTotals = dailyDoc.entries.reduce(
      (totals: any, entry: any) => {
        totals.depositAmount += entry.depositAmount;
        totals.spentAmount += entry.spentAmount;
        totals.productsSold += entry.productsSold;
        totals.userLogins += entry.userLogins;
        return totals;
      },
      { depositAmount: 0, spentAmount: 0, productsSold: 0, userLogins: 0 }
    );

    // Update monthly statistics
    const month = date.slice(0, 7); // e.g., "2023-10"
    let monthlyDoc = await MonthlyStatistics.findOne({ month });
    if (!monthlyDoc) {
      monthlyDoc = new MonthlyStatistics({ month, days: [] });
    }

    const dayIndex = monthlyDoc.days.findIndex((day: any) => day.date === date);
    if (dayIndex !== -1) {
      monthlyDoc.days[dayIndex] = { date, ...dailyTotals };
    } else {
      monthlyDoc.days.push({ date, ...dailyTotals });
    }
    await monthlyDoc.save();

    return NextResponse.json({ message: 'Statistics updated successfully' });
  } catch (error) {
    console.error('Error updating statistics:', error);
    return NextResponse.json(
      { error: 'Failed to update statistics', details: error },
      { status: 500 }
    );
  }
}
