import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Log from '@/models/Log';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const logType = url.searchParams.get('type') || 'All';
    await connectToDatabase();
    let query = Log.find();
    if (logType !== 'All') {
      query = query.where('activity.type').equals(logType);
    }
    const logs = await query.sort({ timestamp: 1 }).lean().exec();
    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
