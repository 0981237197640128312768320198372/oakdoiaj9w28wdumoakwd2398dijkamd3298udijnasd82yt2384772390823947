/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ApiKey from '@/models/ApiKeys';

// GET: Retrieve API keys with optional filtering
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
    query.limit = { $gte: limitValue };
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

// POST: Create a new API key with a specified key and limit
export async function POST(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();
  const { key, limit } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
  }
  if (!limit || typeof limit !== 'number') {
    return NextResponse.json({ error: 'Limit is required and must be a number' }, { status: 400 });
  }

  // Check if the key already exists
  const existingKey = await ApiKey.findOne({ key });
  if (existingKey) {
    return NextResponse.json({ error: 'API key already exists' }, { status: 409 });
  }

  const newApiKey = new ApiKey({ key, limit });
  await newApiKey.save();

  return NextResponse.json({ message: 'API key created', apiKey: newApiKey }, { status: 201 });
}

// PUT: Update an existing API key's limit
export async function PUT(request: NextRequest) {
  await connectToDatabase();
  const body = await request.json();
  const { key, limit } = body;

  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Key is required and must be a string' }, { status: 400 });
  }
  if (limit === undefined || typeof limit !== 'number') {
    return NextResponse.json({ error: 'Limit is required and must be a number' }, { status: 400 });
  }

  const apiKey = await ApiKey.findOneAndUpdate({ key }, { limit }, { new: true });
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
