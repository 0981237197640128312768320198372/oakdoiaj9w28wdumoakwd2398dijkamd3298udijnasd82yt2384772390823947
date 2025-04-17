import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { rdpId, status, parameters } = await request.json();
  if (!rdpId || !status) {
    return NextResponse.json({ message: 'Missing rdpId or status' }, { status: 400 });
  }
  if (status !== 'running' && status !== 'stopped') {
    return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const collection = db.collection('rdpStates');
  await collection.updateOne(
    { rdpId },
    { $set: { asdState: { status, parameters: parameters || [] } } },
    { upsert: true }
  );

  return NextResponse.json({ message: 'ASD state set successfully' });
}
