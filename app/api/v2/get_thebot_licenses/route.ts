import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();

    // Ensure the database connection is ready
    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }

    // Get all collection names from the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Filter collections that match the pattern "BotUpdate_*" and extract licenses
    const licenses = collections
      .filter((collection) => collection.name.startsWith('BotUpdate_'))
      .map((collection) => collection.name.replace('BotUpdate_', ''));

    return NextResponse.json({ licenses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}
