import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }

    const collections = await mongoose.connection.db.listCollections().toArray();

    const licenses = collections
      .filter((collection) => collection.name.startsWith('TheBotLogs_'))
      .map((collection) => collection.name.replace('TheBotLogs_', ''));

    return NextResponse.json({ licenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}
