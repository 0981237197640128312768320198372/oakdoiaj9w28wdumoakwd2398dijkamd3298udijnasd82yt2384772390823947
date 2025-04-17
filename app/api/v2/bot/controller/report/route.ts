import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/db';

export async function POST(request: Request) {
  const report = await request.json();
  const { type } = report;

  const db = await connectToDatabase();

  if (type === 'asd') {
    const { rdpId, status, message } = report;
    if (!rdpId || !status) {
      return NextResponse.json({ message: 'Missing rdpId or status' }, { status: 400 });
    }
    const collection = db.collection('rdpStates');
    await collection.updateOne(
      { rdpId },
      { $set: { lastReportedStatus: { status, message, timestamp: new Date() } } }
    );
  } else if (type === 'command') {
    const { commandId, status, result } = report;
    if (!commandId || !status) {
      return NextResponse.json({ message: 'Missing commandId or status' }, { status: 400 });
    }
    const collection = db.collection('commands');
    await collection.updateOne(
      { _id: new ObjectId(commandId) },
      { $set: { status, result, completedAt: new Date() } }
    );
  } else {
    return NextResponse.json({ message: 'Unknown report type' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Report processed successfully' });
}
