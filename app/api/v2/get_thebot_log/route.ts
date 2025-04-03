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

    let query = TheBot.find();
    if (type !== 'All') {
      query = query.where('type').equals(type);
    }

    const logs = await query.sort({ timestamp: 1 }).lean().exec();

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bot logs:', error);
    return NextResponse.json({ error: 'Failed to fetch bot logs' }, { status: 500 });
  }
}
