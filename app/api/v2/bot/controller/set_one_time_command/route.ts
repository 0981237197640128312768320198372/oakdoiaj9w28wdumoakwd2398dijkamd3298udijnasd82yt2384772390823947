import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { rdpId, command } = await request.json();
  if (!rdpId || !command) {
    return NextResponse.json({ message: 'Missing rdpId or command' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const collection = db.collection('commands');
  await collection.insertOne({
    rdpId,
    command,
    status: 'pending',
    createdAt: new Date(),
  });

  return NextResponse.json({ message: 'Command queued successfully' });
}
