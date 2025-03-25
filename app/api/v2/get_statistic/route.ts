/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DailyStatistics from '@/models/DailyStatistics';
import MonthlyStatistics from '@/models/MonthlyStatistics';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const dateType = url.searchParams.get('type') || 'daily';
    const date = url.searchParams.get('date');
    const fetchAll = url.searchParams.get('fetchAll') === 'true';

    let model;
    if (dateType === 'daily') {
      model = DailyStatistics;
    } else if (dateType === 'monthly') {
      model = MonthlyStatistics;
    } else {
      return NextResponse.json({ error: "Invalid 'type' parameter" }, { status: 400 });
    }

    if (fetchAll) {
      const allDocs = await model.find({}).sort({ date: 1 });
      const dataObject = allDocs.reduce((acc: Record<string, any>, doc: any) => {
        acc[dateType === 'daily' ? doc.date : doc.month] =
          dateType === 'daily' ? doc.entries : doc.days;
        return acc;
      }, {});
      return NextResponse.json({ data: dataObject });
    }

    if (!date) {
      return NextResponse.json({ error: "Missing 'date' parameter" }, { status: 400 });
    }

    const specificDoc = await model.findOne(dateType === 'daily' ? { date } : { month: date });
    if (!specificDoc) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({
      data: dateType === 'daily' ? specificDoc.entries : specificDoc.days,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error },
      { status: 500 }
    );
  }
}
