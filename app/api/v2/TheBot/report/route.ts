/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { TheBot } from '@/models/TheBot';
import mongoose from 'mongoose';

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
    const activity = { type: 'state_change', message, details: { botState } };
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
  } else {
    return NextResponse.json({ message: 'Unknown report type' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Report processed successfully' });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('botId');
  if (!botId) {
    return new Response('Missing botId', { status: 400 });
  }

  await connectToDatabase();

  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  const stream = new ReadableStream({
    async start(controller) {
      const bot = await TheBot.findOne({ botId });
      if (bot) {
        controller.enqueue(
          `data: ${JSON.stringify({
            type: 'state_change',
            botState: bot.botState,
            parameters: bot.parameters,
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
      }

      const changeStream = TheBot.watch([{ $match: { 'fullDocument.botId': botId } }], {
        fullDocument: 'updateLookup',
      });

      let lastSentTimestamp = new Date();

      changeStream.on('change', (change) => {
        if (change.operationType === 'update' && change.fullDocument) {
          const bot = change.fullDocument;
          const newActivities = bot.activity.filter((a: any) => a.timestamp > lastSentTimestamp);
          for (const activity of newActivities) {
            controller.enqueue(`data: ${JSON.stringify(activity)}\n\n`);
          }
          if (newActivities.length > 0) {
            lastSentTimestamp = newActivities[newActivities.length - 1].timestamp;
          }
          if (change.updateDescription.updatedFields.botState) {
            controller.enqueue(
              `data: ${JSON.stringify({
                type: 'state_change',
                botState: bot.botState,
                parameters: bot.parameters,
                timestamp: new Date().toISOString(),
              })}\n\n`
            );
          }
        }
      });

      request.signal.addEventListener('abort', () => {
        changeStream.close();
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
