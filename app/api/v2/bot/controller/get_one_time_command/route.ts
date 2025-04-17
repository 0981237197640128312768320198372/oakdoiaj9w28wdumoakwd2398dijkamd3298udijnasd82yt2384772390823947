import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

interface Command {
  _id: string;
  command: string;
  rdpId: string;
  status: string;
  createdAt: Date;
  executedAt?: Date;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rdpId = searchParams.get('rdpId');

  if (!rdpId) {
    return NextResponse.json({ message: 'Missing rdpId' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const collection = db.collection('commands');

  const commandDoc = (await collection.findOneAndUpdate(
    { rdpId, status: 'pending' },
    { $set: { status: 'in-progress', executedAt: new Date() } },
    { sort: { createdAt: 1 }, returnDocument: 'after' }
  )) as unknown as { value: Command | null };

  if (commandDoc.value) {
    return NextResponse.json({
      _id: commandDoc.value._id,
      command: commandDoc.value.command,
    });
  } else {
    return NextResponse.json({ message: 'No pending commands' });
  }
}
