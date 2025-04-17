import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rdpId = searchParams.get('rdpId');

  // Validate rdpId presence
  if (!rdpId) {
    return NextResponse.json({ message: 'Missing rdpId' }, { status: 400 });
  }

  // Connect to the database and get the commands collection
  const db = await connectToDatabase();
  const collection = db.collection('commands');

  // Find and update the command document
  const commandDoc = await collection.findOneAndUpdate(
    { rdpId, status: 'pending' }, // Query to find a pending command for the given rdpId
    { $set: { status: 'in-progress', executedAt: new Date() } }, // Update status and set execution time
    { sort: { createdAt: 1 }, returnDocument: 'after' } // Sort by creation date and return the updated document
  );

  // Check if a document was found and updated
  if (commandDoc && commandDoc.value) {
    return NextResponse.json({
      _id: commandDoc.value._id,
      command: commandDoc.value.command,
    });
  } else {
    return NextResponse.json({ message: 'No pending commands' });
  }
}
