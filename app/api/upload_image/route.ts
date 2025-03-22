// import mongoose from 'mongoose';
// import { GridFSBucket } from 'mongodb';

// interface DatabaseConnection {
//   gridFSBucket: GridFSBucket;
// }

// let cachedConnection: DatabaseConnection | null = null;

// export async function connectToDatabase(): Promise<DatabaseConnection> {
//   if (cachedConnection) {
//     return cachedConnection;
//   }

//   const MONGODB_URI = process.env.MONGODB_URI;
//   if (!MONGODB_URI) {
//     throw new Error('MONGODB_URI is not defined in environment variables');
//   }

//   await mongoose.connect(MONGODB_URI);
//   const db = mongoose.connection.db;
//   const gridFSBucket = new GridFSBucket(db, { bucketName: 'images' });

//   cachedConnection = { gridFSBucket };
//   return cachedConnection;
// }
