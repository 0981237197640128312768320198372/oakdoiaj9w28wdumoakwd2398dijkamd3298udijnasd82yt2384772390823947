/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ApiKey from '@/models/ApiKeys';

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const limit_upto = searchParams.get('limit_upto');

  let query: any = {};

  if (key) {
    query.key = key;
  }

  if (limit_upto) {
    const limitValue = parseInt(limit_upto, 10);
    if (isNaN(limitValue)) {
      return NextResponse.json({ error: 'Invalid limit_upto value' }, { status: 400 });
    }

    query.$or = [
      { resetDate: { $lte: new Date() } },
      {
        remainingLimit: { $gte: limitValue },
        $or: [{ resetDate: { $exists: false } }, { resetDate: { $gt: new Date() } }],
      },
    ];
  }

  try {
    const apiKeys = await ApiKey.find(query);
    if (apiKeys.length === 0) {
      return NextResponse.json({ error: 'No API keys found' }, { status: 404 });
    }
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();
  const { key, remainingLimit } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
  }
  if (!remainingLimit || typeof remainingLimit !== 'number') {
    return NextResponse.json(
      { error: 'Remaining limit is required and must be a number' },
      { status: 400 }
    );
  }

  const existingKey = await ApiKey.findOne({ key });
  if (existingKey) {
    return NextResponse.json({ error: 'API key already exists' }, { status: 409 });
  }

  const newApiKey = new ApiKey({ key, remainingLimit });
  await newApiKey.save();

  return NextResponse.json({ message: 'API key created', apiKey: newApiKey }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();
  const { key, remainingLimit, resetDate } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
  }
  if (remainingLimit === undefined || typeof remainingLimit !== 'number') {
    return NextResponse.json(
      { error: 'Remaining limit is required and must be a number' },
      { status: 400 }
    );
  }
  // Optional: Validate resetDate if provided
  if (resetDate !== undefined && isNaN(new Date(resetDate).getTime())) {
    return NextResponse.json({ error: 'Reset date must be a valid date' }, { status: 400 });
  }

  const updateData = { remainingLimit, resetDate };
  if (resetDate !== undefined) updateData.resetDate = resetDate;

  const apiKey = await ApiKey.findOneAndUpdate({ key }, updateData, { new: true });
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'API key updated', apiKey });
}

// DELETE: Delete an API key by its key
export async function DELETE(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();
  const { key } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
  }

  const result = await ApiKey.deleteOne({ key });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'API key deleted' });
}
