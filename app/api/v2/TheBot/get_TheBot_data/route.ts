import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';

const cleanOldActivities = async () => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await TheBot.updateMany(
      {},
      {
        $pull: {
          activity: {
            timestamp: { $lt: fortyEightHoursAgo },
          },
        },
      }
    );
  } catch (error) {
    console.error('Error cleaning old activities:', error);
  }
};

export async function GET() {
  await connectToDatabase();
  await cleanOldActivities();
  const bots = await TheBot.find({});
  return NextResponse.json({ bots });
}
