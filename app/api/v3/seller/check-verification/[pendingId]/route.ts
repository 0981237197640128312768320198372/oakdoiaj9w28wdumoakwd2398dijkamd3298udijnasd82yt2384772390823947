import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { PendingRegistration } from '@/models/v3/PendingRegistration';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pendingId: string }> }
) {
  try {
    const { pendingId } = await params;

    if (!pendingId) {
      return NextResponse.json({ error: 'Missing pendingId' }, { status: 400 });
    }

    await connectToDatabase();

    // First check if a seller was created with this verification code
    const pendingRegistration = await PendingRegistration.findById(pendingId);

    if (!pendingRegistration) {
      // Check if seller already exists (verification completed)
      const existingSeller = await Seller.findOne({
        'verification.code': { $exists: true },
      }).sort({ createdAt: -1 });

      if (existingSeller) {
        return NextResponse.json({
          status: 'verified',
          storeName: existingSeller.store.name,
          message: 'Verification completed successfully!',
        });
      }

      return NextResponse.json({
        status: 'expired',
        message: 'Verification code has expired or is invalid',
      });
    }

    // Check if verification code is expired
    if (new Date() > pendingRegistration.verification.expiresAt) {
      // Clean up expired registration
      await PendingRegistration.deleteOne({ _id: pendingId });

      return NextResponse.json({
        status: 'expired',
        message: 'Verification code has expired',
      });
    }

    // Still pending
    return NextResponse.json({
      status: 'pending',
      message: 'Waiting for LINE verification',
      expiresAt: pendingRegistration.verification.expiresAt,
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
