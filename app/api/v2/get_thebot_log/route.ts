import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import getTheBotModel from '@/models/TheBot';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const license = url.searchParams.get('license');
    const type = url.searchParams.get('type') || 'All';

    if (!license) {
      return NextResponse.json({ error: 'License is required' }, { status: 400 });
    }

    await connectToDatabase();
    const TheBot = getTheBotModel(license);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    await TheBot.deleteMany({
      timestamp: { $lt: sevenDaysAgoISO },
      'activity.type': { $ne: 'success' },
    });

    let query = TheBot.find();
    if (type !== 'All') {
      query = query.where('activity.type').equals(type);
    }

    const logs = await query.sort({ timestamp: 1 }).lean().exec();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching or cleaning bot logs:', error);
    return NextResponse.json({ error: 'Failed to fetch or clean bot logs' }, { status: 500 });
  }
}
