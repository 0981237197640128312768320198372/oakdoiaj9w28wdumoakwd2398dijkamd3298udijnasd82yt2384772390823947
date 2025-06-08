import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { LineService } from '@/lib/services/lineService';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { sellerId } = body;

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    // Find the seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Check if seller is already verified
    if (seller.verification?.status === 'verified') {
      return NextResponse.json({ error: 'Seller is already verified' }, { status: 400 });
    }

    // Generate new verification code
    const { code, expiresAt } = LineService.generateVerificationCode();

    // Update seller with new verification code
    seller.verification = {
      code,
      status: 'pending',
      expiresAt,
    };

    await seller.save();

    return NextResponse.json({
      success: true,
      verificationCode: code,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
