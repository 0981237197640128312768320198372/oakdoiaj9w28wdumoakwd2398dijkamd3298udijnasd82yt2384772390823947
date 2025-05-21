import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const username = body.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required in the request body' },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({ username }).select('-password').select('-email').lean();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }
    return NextResponse.json({ seller });
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}
