import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Log from '@/models/Log';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_LOGGING_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { logEntry } = await request.json();

  if (!logEntry) {
    return NextResponse.json({ error: 'Log entry is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const timestamp = new Date().toISOString();

    const newLog = new Log({
      timestamp,
      activity: logEntry,
    });
    await newLog.save();

    return NextResponse.json({ message: 'Log added successfully' });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}
