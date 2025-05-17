import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { StoreStatistics } from '@/models/v3/StoreStatistics';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { username, email, password, contact, store } = body;

    if (!username || !email || !password || !store?.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return NextResponse.json({ error: 'Seller already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSeller = new Seller({
      username,
      email,
      password: hashedPassword,
      contact,
      store,
    });

    await newSeller.save();

    const newStoreStatistics = new StoreStatistics({
      sellerId: newSeller._id,
    });
    await newStoreStatistics.save();

    return NextResponse.json({ message: 'Seller registered successfully ' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
