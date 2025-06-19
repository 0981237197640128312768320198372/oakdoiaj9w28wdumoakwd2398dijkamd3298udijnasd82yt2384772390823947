/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient, ObjectId } from 'mongodb';

// Types
export interface BotActivity {
  _id: string;
  timestamp: string;
  type: 'state_change' | 'command' | 'error';
  message: string;
  details?: Record<string, any>;
  command?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface Bot {
  _id?: string | ObjectId;
  botId: string;
  botState: 'running' | 'stopped' | 'idle' | 'error';
  parameters: string[];
  webhookUrl?: string;
  lastSeen?: Date;
  activity: BotActivity[];
}

// MongoDB connection
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (client) return client;

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  client = new MongoClient(uri);

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Bot Registry (in-memory for development, should use Redis or similar in production)
// This is also stored as a global variable to persist between API calls
declare global {
  var botRegistry:
    | {
        [botId: string]: {
          webhookUrl: string;
          lastSeen: Date;
          status: 'idle' | 'running' | 'error' | 'stopped';
          parameters?: string[];
        };
      }
    | undefined;
}

global.botRegistry = global.botRegistry || {};

export const botRegistry = global.botRegistry;

// Database operations
export async function getBots(): Promise<Bot[]> {
  const client = await connectToDatabase();
  const collection = client.db('botController').collection('bots');
  const bots = (await collection.find({}).toArray()) as Bot[];
  return bots;
}

export async function getBot(botId: string): Promise<Bot | null> {
  const client = await connectToDatabase();
  const collection = client.db('botController').collection('bots');
  const bot = (await collection.findOne({ botId })) as Bot | null;
  return bot;
}

export async function updateBot(botId: string, update: Partial<Bot>): Promise<void> {
  const client = await connectToDatabase();
  const collection = client.db('botController').collection('bots');
  await collection.updateOne({ botId }, { $set: update });
}

export async function addBotActivity(botId: string, activity: BotActivity): Promise<void> {
  const client = await connectToDatabase();
  const collection = client.db('botController').collection<Bot>('bots');
  await collection.updateOne({ botId }, { $push: { activity } });
}

export async function updateBotActivity(
  botId: string,
  activityId: string,
  update: Partial<BotActivity>
): Promise<void> {
  const client = await connectToDatabase();
  const collection = client.db('botController').collection('bots');

  // Find the bot and update the specific activity
  await collection.updateOne(
    { botId, 'activity._id': activityId },
    {
      $set: Object.entries(update).reduce((acc, [key, value]) => {
        acc[`activity.$.${key}`] = value;
        return acc;
      }, {} as Record<string, any>),
    }
  );
}

// Handle bot registration and webhook management
export async function registerBot(botId: string, webhookUrl: string): Promise<void> {
  // Update in-memory registry
  botRegistry[botId] = {
    webhookUrl,
    lastSeen: new Date(),
    status: 'idle',
  };

  // Check if bot exists in database
  const bot = await getBot(botId);
  const client = await connectToDatabase();
  const collection = client.db('botController').collection('bots');

  if (!bot) {
    // Create new bot in database with webhook URL
    await collection.insertOne({
      botId,
      botState: 'idle',
      parameters: [],
      webhookUrl,
      lastSeen: new Date(),
      activity: [
        {
          _id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'state_change',
          message: 'Bot registered',
        },
      ],
    });
  } else {
    // Update existing bot with webhook URL
    await collection.updateOne(
      { botId },
      {
        $set: {
          webhookUrl,
          lastSeen: new Date(),
        },
      }
    );
  }
}
