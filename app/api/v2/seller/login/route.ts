import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import Seller from '@/models/Seller';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
  }

  try {
    const seller = await Seller.findOne({ username });

    if (!seller) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: seller._id, username: seller.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '2h' }
    );

    const redirectUrl = '/app/seller';

    return NextResponse.json({ token, redirectUrl });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
