import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';

export async function POST(request: Request) {
  const { botId, botState, parameters } = await request.json();
  if (!botId || !botState) {
    return NextResponse.json({ message: 'Missing botId or botState' }, { status: 400 });
  }
  if (!['running', 'stopped'].includes(botState)) {
    return NextResponse.json({ message: 'Invalid botState' }, { status: 400 });
  }

  await connectToDatabase();
  const activity = {
    type: 'state_change',
    message: `Bot state set to ${botState}`,
    details: { botState, parameters },
  };
  await TheBot.updateOne(
    { botId },
    { $set: { botState, parameters: parameters || [] }, $push: { activity } },
    { upsert: true }
  );

  return NextResponse.json({ message: 'Bot state set successfully' });
}
