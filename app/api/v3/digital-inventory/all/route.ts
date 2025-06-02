/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { DigitalInventory } from '@/models/v3/DigitalInventory';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';

function jwtAuthenticate(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: 'Missing token', status: 401 };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };
    return { sellerId: decoded._id };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    // Get all digital inventory items for the seller
    const variants = await DigitalInventory.find({ sellerId }).sort({ createdAt: -1 });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Error fetching all digital inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
