/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import getTheBotModel from '@/models/TheBot';

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_LOGGING_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!mongoose.connection.db) {
    throw new Error('Database connection is not established');
  }
  const { license } = await request.json();

  if (!license) {
    return NextResponse.json({ error: 'License is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Get the model for the specific license
    const BotUpdate = getTheBotModel(license);

    // Drop the collection for the license
    await mongoose.connection.db.dropCollection(`TheBot_${license}`);

    return NextResponse.json({ message: `Logs for license ${license} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting logs for license ${license}:`, error);
    return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 });
  }
}
