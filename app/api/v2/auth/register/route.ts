/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { username, password, personalKey, email, roles, contact, shop, credits } =
      await req.json();

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      personalKey,
      roles: roles || ['buyer'],
      contact,
      shop: roles?.includes('seller') ? shop : undefined,
      credits: credits || { positive: 0, negative: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error instanceof mongoose.Error.ValidationError || error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username or personalKey already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
