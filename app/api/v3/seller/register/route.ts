/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { StoreStatistics } from '@/models/v3/StoreStatistics';
import { Theme } from '@/models/v3/Theme';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { username, email, password, contact, store } = body;

    // Validate required fields
    if (!username || !email || !password || !store?.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate seller
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return NextResponse.json({ error: 'Seller already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create seller without theme initially
    const newSeller = new Seller({
      username,
      email,
      password: hashedPassword,
      contact,
      store: {
        name: store.name,
        description: store.description,
        logoUrl: store.logoUrl,
        rating: store.rating || 0,
        credits: store.credits || { positive: 0, negative: 0 },
      },
    });

    await newSeller.save();

    // Create and link theme
    try {
      const themeData = store.theme || {};
      const newTheme = new Theme({
        sellerId: newSeller._id,
        ...themeData,
      });
      await newTheme.save();

      newSeller.store.theme = newTheme._id;
      await newSeller.save();
    } catch (themeError) {
      console.error('Error creating theme:', themeError);
      // Clean up by deleting the seller if theme creation fails
      await Seller.deleteOne({ _id: newSeller._id });
      return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 });
    }

    try {
      const newStoreStatistics = new StoreStatistics({
        sellerId: newSeller._id,
      });
      await newStoreStatistics.save();
    } catch (statsError) {
      console.error('Error creating store statistics:', statsError);
      // Clean up could be added here too, but for now, just return an error
      return NextResponse.json({ error: 'Failed to create store statistics' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Seller registered successfully' }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
