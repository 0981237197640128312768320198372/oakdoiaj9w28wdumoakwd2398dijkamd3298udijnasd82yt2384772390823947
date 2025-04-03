import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import mongoose from 'mongoose';
import getTheBotModel from '@/models/TheBot';

interface BotLog {
  timestamp: string;
}
export async function GET() {
  try {
    await connectToDatabase();

    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }

    // Get all collection names from the database
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Filter collections that match the pattern "TheBot_*"
    const licenses = collections
      .filter((collection) => collection.name.startsWith('TheBot_'))
      .map((collection) => collection.name.replace('TheBot_', ''));

    // Fetch the last activity timestamp for each license
    const licenseData = await Promise.all(
      licenses.map(async (license) => {
        try {
          const BotUpdate = getTheBotModel(license);
          // Fetch the most recent log with explicit typing
          const latestLog = await BotUpdate.findOne<BotLog>()
            .sort({ timestamp: -1 })
            .select('timestamp')
            .lean()
            .exec();
          return {
            license,
            lastActivity: latestLog ? latestLog.timestamp : null,
          };
        } catch (error) {
          console.error(`Error fetching last activity for license ${license}:`, error);
          return { license, lastActivity: null };
        }
      })
    );

    return NextResponse.json({ licenses: licenseData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json({ error: 'Failed to fetch licenses' }, { status: 500 });
  }
}
