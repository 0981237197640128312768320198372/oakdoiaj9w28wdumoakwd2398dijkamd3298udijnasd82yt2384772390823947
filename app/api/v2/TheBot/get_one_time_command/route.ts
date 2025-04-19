/* eslint-disable @typescript-eslint/no-explicit-any */
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
  if (bot) {
    const pendingIndex = bot.activity.findIndex(
      (a: any) => a.type === 'command' && a.status === 'pending'
    );
    if (pendingIndex !== -1) {
      bot.activity[pendingIndex].status = 'in-progress';
      bot.activity[pendingIndex].timestamp = new Date();
      await bot.save();
      const command = bot.activity[pendingIndex];
      return NextResponse.json({ _id: command._id, command: command.command });
    }
  }
  return NextResponse.json({ message: 'No pending commands' });
}
