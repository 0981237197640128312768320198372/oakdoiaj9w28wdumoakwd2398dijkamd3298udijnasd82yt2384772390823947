/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import DATAInfo from '@/models/DATAInfo';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'perspicacity';

const validateJwt = (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Unauthorization' };
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired token' };
  }
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const { action, data } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action !== 'add') {
      const { valid, error } = validateJwt(request);
      if (!valid) {
        return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
      }
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
    const { valid, error } = validateJwt(request);
    if (!valid) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'All';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const countsOnly = searchParams.get('countsOnly') === 'true';

    let query = {};
    if (type !== 'All') {
      query = { type };
    }

    if (countsOnly) {
      const used = await DATAInfo.countDocuments({ ...query, type: 'Used' });
      const unused = await DATAInfo.countDocuments({ ...query, type: 'Unused' });
      const bad = await DATAInfo.countDocuments({ ...query, type: 'Bad' });
      return NextResponse.json({ counts: { Used: used, Unused: unused, Bad: bad } });
    }

    const skip = (page - 1) * limit;
    const entries = await DATAInfo.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean();
    const total = await DATAInfo.countDocuments(query);

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error('Error fetching DATA data:', error);
    return NextResponse.json({ error: 'Failed to fetch DATA data' }, { status: 500 });
  }
}
