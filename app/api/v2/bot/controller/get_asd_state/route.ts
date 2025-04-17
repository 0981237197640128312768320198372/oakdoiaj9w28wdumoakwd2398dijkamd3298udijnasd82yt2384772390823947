import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rdpId = searchParams.get('rdpId');
  if (!rdpId) {
    return NextResponse.json({ message: 'Missing rdpId' }, { status: 400 });
  }

  const db = await connectToDatabase();
  const collection = db.collection('rdpStates');
  const state = await collection.findOne({ rdpId });

  if (state) {
    return NextResponse.json(state.asdState);
  } else {
    return NextResponse.json({ status: 'stopped', parameters: [] }); // Default state
  }
}
