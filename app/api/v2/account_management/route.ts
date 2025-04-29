/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Account from '@/models/Account';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const status = searchParams.get('status');
    const email = searchParams.get('email');
    const search = searchParams.get('search');

    const query: any = {};
    if (status) query.status = status;
    if (email) query.email = email;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { detail: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: any = {};
    if (sortBy) sort[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const accounts = await Account.find(query).sort(sort).skip(skip).limit(limit).lean();

    const total = await Account.countDocuments(query);
    return NextResponse.json({
      accounts,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password, status, detail } = body;

    if (!email || !password || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAccount = new Account({ email, password, status, detail });
    await newAccount.save();

    return NextResponse.json({ message: 'Account created', account: newAccount });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
    }

    const account = await Account.findByIdAndUpdate(id, updates, { new: true });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Account updated', account });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
