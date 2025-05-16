/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';
import mongoose from 'mongoose';

interface Activity {
  _id: mongoose.Types.ObjectId;
  timestamp: Date;
  type: string;
  message?: string;
  details?: any;
  command?: string;
  status?: string;
  output?: string;
  error?: string;
}

interface Bot {
  botId: string;
  botState: string;
  parameters: string[];
  activity: Activity[];
}

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

export async function POST(request: Request) {
  await connectToDatabase();
  const report = await request.json();
  const { type, botId } = report;

  if (!botId) {
    return NextResponse.json({ message: 'Missing botId' }, { status: 400 });
  }

  if (type === 'state_change') {
    const { botState, message } = report;
    if (!botState) {
      return NextResponse.json({ message: 'Missing botState' }, { status: 400 });
    }
    const activity: Activity = {
      _id: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
      type: 'state_change',
      message,
      details: { botState },
    };
    await TheBot.updateOne(
      { botId },
      { $set: { botState }, $push: { activity } },
      { upsert: true }
    );
  } else if (type === 'command_update') {
    const { activityId, status, output, error } = report;
    if (!activityId || !status) {
      return NextResponse.json({ message: 'Missing activityId or status' }, { status: 400 });
    }
    const update: any = { 'activity.$.status': status };
    if (output) update['activity.$.output'] = output;
    if (error) update['activity.$.error'] = error;
    await TheBot.updateOne(
      { botId, 'activity._id': new mongoose.Types.ObjectId(activityId) },
      { $set: update }
    );
  } else if (type === 'dokmai-bot') {
    const { message, status } = report;
    const activity: Activity = {
      _id: new mongoose.Types.ObjectId(),
      timestamp: new Date(),
      type: 'dokmai-bot',
      message,
      status,
    };
    await TheBot.updateOne({ botId }, { $push: { activity } }, { upsert: true });
  }

  await cleanOldActivities();

  return NextResponse.json({ message: 'Report processed successfully' });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');
  const filter = searchParams.get('filter');

  await connectToDatabase();

  try {
    if (botId) {
      const bot = (await TheBot.findOne({ botId }).lean()) as unknown as Bot;
      if (!bot) {
        return new Response('Bot not found', { status: 404 });
      }
      if (filter === 'success-dokmai-bot') {
        bot.activity = bot.activity.filter(
          (act: Activity) => act.type === 'dokmai-bot' && act.status === 'success'
        );
      }
      return NextResponse.json(bot);
    } else {
      const bots = (await TheBot.find().lean()) as unknown as Bot[];
      if (filter === 'success-dokmai-bot') {
        bots.forEach((bot) => {
          bot.activity = bot.activity.filter(
            (act: Activity) => act.type === 'dokmai-bot' && act.status === 'success'
          );
        });
      }
      return NextResponse.json(bots);
    }
  } catch (error) {
    console.error('Error fetching bot data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
