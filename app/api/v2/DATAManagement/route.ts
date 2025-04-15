/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DATAInfo from '@/models/DATAInfo';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { action, data } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'add':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Data must be an array for add action' },
            { status: 400 }
          );
        }
        const newEntries = await DATAInfo.insertMany(data);
        return NextResponse.json({ message: 'Entries added', entries: newEntries });

      case 'update':
        if (!data || !Array.isArray(data) || !data.every((item) => item._id)) {
          return NextResponse.json(
            { error: 'Data must be an array of objects with _id for update action' },
            { status: 400 }
          );
        }
        const updatePromises = data.map(async (item: any) => {
          const { _id, ...updates } = item;
          return await DATAInfo.findByIdAndUpdate(_id, updates, { new: true });
        });
        const updatedEntries = await Promise.all(updatePromises);
        return NextResponse.json({ message: 'Entries updated', entries: updatedEntries });

      case 'remove':
        if (!data || !Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Data must be an array of IDs for remove action' },
            { status: 400 }
          );
        }
        await DATAInfo.deleteMany({ _id: { $in: data } });
        return NextResponse.json({ message: 'Entries removed' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing DATA data:', error);
    return NextResponse.json({ error: 'Failed to manage DATA data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'All';

    let query = {};
    if (type !== 'All') {
      query = { type };
    }

    const entries = await DATAInfo.find(query).sort({ date: -1 }).lean();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching DATA data:', error);
    return NextResponse.json({ error: 'Failed to fetch DATA data' }, { status: 500 });
  }
}
