import { type NextRequest, NextResponse } from 'next/server';
import { Buyer } from '@/models/v3/Buyer';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { generatePersonalKey } from '@/lib/utils';
import { createRegistrationActivity } from '@/lib/activityHelpers';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, username, password, personalKey, contact, storeId, ipAddress = {} } = body;

    if (!ipAddress) {
      return NextResponse.json(
        { success: false, message: 'IP Address is required' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    const existingEmail = await Buyer.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 400 }
      );
    }

    if (username) {
      const existingUsername = await Buyer.findOne({ username });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, message: 'Username already in use' },
          { status: 400 }
        );
      }
    }

    if (personalKey) {
      const existingKey = await Buyer.findOne({ personalKey });
      if (existingKey) {
        return NextResponse.json(
          { success: false, message: 'Personal key already in use' },
          { status: 400 }
        );
      }

      if (!/^[a-zA-Z0-9]{10}$/.test(personalKey)) {
        return NextResponse.json(
          { success: false, message: 'Personal key must be exactly 10 alphanumeric characters' },
          { status: 400 }
        );
      }
    }

    let finalPersonalKey = undefined;

    const isPersonalKeyRegistration = !username || !password;

    if (isPersonalKeyRegistration) {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const candidateKey = generatePersonalKey();
        const existingKey = await Buyer.findOne({ personalKey: candidateKey });

        if (!existingKey) {
          finalPersonalKey = candidateKey;
          break;
        }
        attempts++;
      }

      if (!finalPersonalKey) {
        return NextResponse.json(
          { success: false, message: 'Unable to generate unique personal key. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      if (!username || !password) {
        return NextResponse.json(
          {
            success: false,
            message: 'Username and password are required for credential-based registration',
          },
          { status: 400 }
        );
      }
    }

    const newBuyer = new Buyer({
      name,
      email,
      username: username || undefined,
      password: password || undefined,
      personalKey: finalPersonalKey,
      contact,
      storeId,
      activities: [],
    });

    await newBuyer.save();

    try {
      const userAgent = request.headers.get('user-agent') || undefined;

      await createRegistrationActivity({
        userId: newBuyer._id.toString(),
        userType: 'buyer',
        registrationMethod: isPersonalKeyRegistration ? 'personal_key' : 'credentials',
        ipAddress,
        userAgent,
        email: newBuyer.email,
        username: newBuyer.username,
        name: newBuyer.name,
      });
    } catch (activityError) {
      console.error('Failed to create registration activity:', activityError);
    }

    const buyer = await Buyer.findById(newBuyer._id);
    const buyerData = {
      id: buyer._id,
      name: buyer.name,
      email: buyer.email,
      username: buyer.username,
      avatarUrl: buyer.avatarUrl,
      contact: buyer.contact,
      storeId: buyer.storeId,
      createdAt: buyer.createdAt,
      updatedAt: buyer.updatedAt,
    };

    const token = jwt.sign(
      buyerData,
      process.env.JWT_SECRET || 'fallback_secret_not_for_production',
      {
        expiresIn: '2d',
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      token,
      buyer: {
        ...buyerData,
        personalKey: finalPersonalKey,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
