import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface DatabaseConnection {
  connection: mongoose.Connection;
  gridFSBucket: GridFSBucket;
}

let cachedConnection: mongoose.Connection | null = null;
let gridFSBucket: GridFSBucket | null = null;

export async function connectToDatabase(): Promise<DatabaseConnection> {
  if (cachedConnection && gridFSBucket) {
    return { connection: cachedConnection, gridFSBucket };
  }

  const connection = await mongoose.connect(MONGODB_URI);
  cachedConnection = connection.connection;

  const db = cachedConnection.db;
  if (!db) {
    throw new Error('Failed to connect to database: db is undefined');
  }

  gridFSBucket = new GridFSBucket(db);

  return { connection: cachedConnection, gridFSBucket };
}
