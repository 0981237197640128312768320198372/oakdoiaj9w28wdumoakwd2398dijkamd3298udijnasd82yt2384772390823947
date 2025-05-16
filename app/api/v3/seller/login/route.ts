/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { StoreStatistics } from '@/models/v3/StoreStatistics';

// Simple input validation regex
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const PASSWORD_MIN_LENGTH = 8;

export async function POST(req: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase();

    // Parse and validate request body
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error: 'Username must be 3-20 characters long and contain only letters, numbers, _, or -',
        },
        { status: 400 }
      );
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
        { status: 400 }
      );
    }

    // Fetch seller with lean() for performance (returns plain JS object)
    const seller = await Seller.findOne({ username }).lean();
    if (!seller) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Remove password from seller data
    const { password: _, ...sellerData } = seller;

    // Fetch store statistics
    const storeStats = await StoreStatistics.findOne({ sellerId: seller._id }).lean();
    if (!storeStats) {
      return NextResponse.json({ error: 'Store statistics not found' }, { status: 404 });
    }

    // Prepare token payload
    const tokenData = {
      ...sellerData,
      storeStatistics: storeStats,
    };

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(tokenData, jwtSecret, { expiresIn: '6h' });

    // Return token
    return NextResponse.json({ token });
  } catch (error) {
    // Log detailed error for debugging, but keep response generic
    console.error('Login API Error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
