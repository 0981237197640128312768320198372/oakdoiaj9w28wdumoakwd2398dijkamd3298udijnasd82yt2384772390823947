// app/lib/db.ts
import mongoose, { Connection } from 'mongoose';

// Ensure MONGODB_URI is defined in your environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

// Define the structure of the cached connection
interface CachedConnection {
  connection: Connection | null;
}

const cached: CachedConnection = {
  connection: null,
};

/**
 * Connects to MongoDB using Mongoose and caches the connection.
 * @returns The Mongoose Connection object
 */
export async function connectToDatabase(): Promise<Connection> {
  // Return cached connection if it exists
  if (cached.connection) {
    return cached.connection;
  }

  try {
    const mongooseConnection = await mongoose.connect(MONGODB_URI);
    cached.connection = mongooseConnection.connection;

    console.log('MongoDB connected successfully');
    return cached.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

// Optional: Listen for connection events (useful for debugging)
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
