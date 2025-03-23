import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedConnection: mongoose.Connection | null = null;
let gridFSBucket: GridFSBucket | null = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return { connection: cachedConnection, gridFSBucket };
  }

  const connection = await mongoose.connect(MONGODB_URI);
  cachedConnection = connection.connection;
  gridFSBucket = new GridFSBucket(cachedConnection.db);

  return { connection: cachedConnection, gridFSBucket };
}
