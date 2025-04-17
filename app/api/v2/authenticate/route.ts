import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const MAX_ATTEMPTS = 5;
const JWT_SECRET = process.env.JWT_SECRET || 'perspicacity';
const blockedUserSchema = new mongoose.Schema({
  blockKey: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  blockedAt: { type: Number, default: null },
});

const BlockedUser = mongoose.models.BlockedUser || mongoose.model('BlockedUser', blockedUserSchema);

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const ip =
      req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const blockKey = `${ip}__${userAgent}`;

    const blockedUser = await BlockedUser.findOne({ blockKey });
    if (blockedUser?.blockedAt) {
      return NextResponse.json({ error: 'Something Wrong.' }, { status: 403 });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      if (!blockedUser) {
        await BlockedUser.create({ blockKey, attempts: 1 });
      } else {
        blockedUser.attempts += 1;
        if (blockedUser.attempts >= MAX_ATTEMPTS) {
          blockedUser.blockedAt = Date.now();
        }
        await blockedUser.save();
      }
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (blockedUser) {
      await BlockedUser.deleteOne({ blockKey });
    }
    // NEW: Generate a JWT token
    const token = jwt.sign(
      { username: user.username, role: user.role }, // Payload: data to include in the token
      JWT_SECRET, // Secret key to sign the token
      { expiresIn: '2d' } // Token expires in 2 days (adjust as needed)
    );

    // MODIFIED: Include the token in the response
    return NextResponse.json({ role: user.role, name: user.name, token });
    return NextResponse.json({ role: user.role, name: user.name });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
