import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';

export async function GET() {
  await connectToDatabase();
  const bots = await TheBot.find({});
  return NextResponse.json({ bots });
}
