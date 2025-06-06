/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { StoreStatistics } from '@/models/v3/StoreStatistics';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { username, password } = await req.json();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    const seller = await Seller.findOne({
      $or: [{ username: trimmedUsername }, { email: trimmedUsername }],
    });
    if (!seller) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await seller.comparePassword(trimmedPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sellerObj = seller.toObject();
    const { password: _, ...sellerData } = sellerObj;
    const storeStats = await StoreStatistics.findOne({ sellerId: seller._id });
    if (!storeStats) {
      return NextResponse.json({ error: 'Store statistics not found' }, { status: 404 });
    }

    const storeStatsObj = storeStats.toObject();

    const tokenData = {
      ...sellerData,
      storeStatistics: storeStatsObj,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET as string);

    return NextResponse.json({ token });
  } catch (error) {
    console.error(`HERE IS THE ERROR \n${error}\n\n`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
