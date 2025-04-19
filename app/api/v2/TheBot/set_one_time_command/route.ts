import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';

export async function POST(request: Request) {
  const { botId, command } = await request.json();
  if (!botId || !command) {
    return NextResponse.json({ message: 'Missing botId or command' }, { status: 400 });
  }

  await connectToDatabase();
  const activity = { type: 'command', command, status: 'pending', timestamp: new Date() };
  await TheBot.updateOne(
    { botId },
    { $push: { activity }, $setOnInsert: { botState: 'stopped', parameters: [] } },
    { upsert: true }
  );

  return NextResponse.json({ message: 'Command queued successfully' });
}
