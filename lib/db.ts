import mongoose from 'mongoose';
import { GridFSBucket, Db } from 'mongodb';

// Ensure MONGODB_URI is defined
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Define the return type for connectToDatabase
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

  // Connect to MongoDB
  const connection = await mongoose.connect(MONGODB_URI);
  cachedConnection = connection.connection;

  // Ensure the connection is established and db is defined
  if (!cachedConnection.db) {
    throw new Error('Failed to connect to database: db is undefined');
  }

  // Create GridFSBucket with the db instance
  gridFSBucket = new GridFSBucket(cachedConnection.db as Db);

  return { connection: cachedConnection, gridFSBucket };
}
