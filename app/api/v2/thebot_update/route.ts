import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import getBotUpdateModel from '@/models/TheBot';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || apiKey !== process.env.NEXT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();

  if (!payload || !payload.license || !payload.timestamp || !payload.type || !payload.message) {
    return NextResponse.json(
      { error: 'License, timestamp, type, and message are required' },
      { status: 400 }
    );
  }

  const { license, timestamp, type, message, details } = payload;

  try {
    await connectToDatabase();

    const BotUpdate = getBotUpdateModel(license);

    const newUpdate = new BotUpdate({
      timestamp,
      type,
      message,
      details: details || {},
    });
    await newUpdate.save();

    return NextResponse.json({ message: 'Bot update logged successfully' });
  } catch (error) {
    console.error('Error logging bot update:', error);
    return NextResponse.json({ error: 'Failed to log bot update' }, { status: 500 });
  }
}
