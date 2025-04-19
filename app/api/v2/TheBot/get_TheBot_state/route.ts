import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');
  if (!botId) {
    return NextResponse.json({ message: 'Missing botId' }, { status: 400 });
  }

  await connectToDatabase();
  const bot = await TheBot.findOne({ botId });
  return NextResponse.json(
    bot
      ? { botState: bot.botState, parameters: bot.parameters }
      : { botState: 'stopped', parameters: [] }
  );
}
