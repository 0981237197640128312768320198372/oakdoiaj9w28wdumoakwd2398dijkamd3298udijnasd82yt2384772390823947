/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { PendingRegistration } from '@/models/v3/PendingRegistration';
import { LineService } from '@/lib/services/lineService';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { username: rawUsername, email: rawEmail, password: rawPassword, contact, store } = body;
    const username = rawUsername.trim().toLowerCase();
    const email = rawEmail.trim();
    const password = rawPassword.trim();

    // Validate required fields
    if (!username || !email || !password || !store?.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for existing seller with same email or username
    const existingSeller = await Seller.findOne({
      $or: [{ email }, { username }],
    });

    if (existingSeller) {
      return NextResponse.json(
        {
          error: 'An account with this email or username already exists',
        },
        { status: 400 }
      );
    }

    // Check for existing pending registration with same email or username
    const existingPending = await PendingRegistration.findOne({
      $or: [{ email }, { username }],
    });

    if (existingPending) {
      // Remove the existing pending registration to allow retry
      await PendingRegistration.deleteOne({ _id: existingPending._id });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code for LINE verification
    const { code, expiresAt } = LineService.generateVerificationCode();

    // Create pending registration (NOT actual seller account)
    const pendingRegistration = new PendingRegistration({
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
        theme: store.theme || {},
      },
      verification: {
        code,
        expiresAt,
        attempts: 0,
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes for entire registration process
    });

    await pendingRegistration.save();

    console.log(`Pending registration created for ${username} with verification code ${code}`);

    return NextResponse.json(
      {
        message:
          'Registration initiated. Please verify your LINE account to complete registration.',
        verificationCode: code,
        expiresAt: expiresAt.toISOString(),
        requiresLineVerification: true,
        pendingId: pendingRegistration._id,
        warning: 'Account will only be created after successful LINE verification.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
