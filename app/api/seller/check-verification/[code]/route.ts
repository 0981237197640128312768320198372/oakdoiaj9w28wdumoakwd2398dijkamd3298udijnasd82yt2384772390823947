import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { LineService } from '@/lib/services/lineService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    await connectToDatabase();

    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }

    // Find seller with the verification code
    const seller = await Seller.findOne({
      'verification.code': code,
    });

    if (!seller) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 404 });
    }

    // Check if code is expired
    if (seller.verification && LineService.isCodeExpired(seller.verification.expiresAt)) {
      // Update status to expired
      seller.verification.status = 'expired';
      await seller.save();

      return NextResponse.json({
        status: 'expired',
        message: 'Verification code has expired',
      });
    }

    return NextResponse.json({
      status: seller.verification?.status || 'pending',
      sellerId: seller._id,
      storeName: seller.store.name,
      expiresAt: seller.verification?.expiresAt?.toISOString(),
      verifiedAt: seller.verification?.verifiedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
