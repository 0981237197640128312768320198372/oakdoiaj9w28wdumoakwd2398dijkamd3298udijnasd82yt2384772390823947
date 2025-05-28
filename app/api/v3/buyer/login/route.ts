import { type NextRequest, NextResponse } from 'next/server';
import { Buyer } from '@/models/v3/Buyer';
import jwt from 'jsonwebtoken';
import { createLoginActivity } from '@/lib/activityHelpers';
import { connectToDatabase } from '@/lib/db';

function getClientIP(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('x-client-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  if (clientIp) {
    return clientIp.trim();
  }

  try {
    const url = new URL(request.url);
    if (url.hostname && url.hostname !== 'localhost') {
      return url.hostname;
    }
  } catch {
    // Ignore URL parsing errors
  }

  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { email, username, password, personalKey } = body;

    if (!email && !username && !personalKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Either email/username with password or personalKey is required',
        },
        { status: 400 }
      );
    }

    if ((email || username) && !password) {
      return NextResponse.json(
        { success: false, message: 'Password is required when using email/username' },
        { status: 400 }
      );
    }

    let buyer;

    if (personalKey) {
      buyer = await Buyer.findOne({ personalKey }).select('-password');

      if (!buyer) {
        return NextResponse.json(
          { success: false, message: 'Invalid personal key' },
          { status: 401 }
        );
      }
    } else {
      const query = email ? { email } : { username };
      buyer = await Buyer.findOne(query);

      if (!buyer) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const isPasswordValid = await buyer.comparePassword(password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      buyer = await Buyer.findById(buyer._id).select('-password');
    }

    try {
      const userAgent = request.headers.get('user-agent') || undefined;
      const ipAddress = getClientIP(request);

      await createLoginActivity({
        userId: buyer._id.toString(),
        userType: 'buyer',
        ipAddress,
        userAgent,
      });
    } catch (activityError) {
      console.error('Failed to create login activity:', activityError);
    }

    const buyerData = {
      id: buyer._id,
      name: buyer.name,
      email: buyer.email,
      username: buyer.username,
      contact: buyer.contact,
      balance: buyer.balance,
      createdAt: buyer.createdAt,
      updatedAt: buyer.updatedAt,
    };

    const token = jwt.sign(
      buyerData,
      process.env.JWT_SECRET || 'fallback_secret_not_for_production',
      {
        expiresIn: '7d',
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      buyer: buyerData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
