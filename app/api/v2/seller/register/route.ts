import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Seller from '@/models/Seller';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const { username, email, password, storeName } = await req.json();
  if (!username || !email || !password || !storeName) {
    return NextResponse.json(
      { error: 'Missing required fields: username, email, password, or storeName' },
      { status: 400 }
    );
  }
  try {
    const existingSeller = await Seller.findOne({ $or: [{ username }, { email }, { storeName }] });
    if (existingSeller) {
      return NextResponse.json({ error: 'Username or email already in use' }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({
      username,
      email,
      password: hashedPassword,
      store: {
        name: storeName,
      },
    });
    await newSeller.save();
    const token = jwt.sign(
      { userId: newSeller._id, username: newSeller.username, roles: ['seller'] },
      process.env.JWT_SECRET as string,
      { expiresIn: '6h' }
    );
    const redirectUrl = '/app/seller';
    return NextResponse.json({ message: 'Seller registered successfully', token, redirectUrl });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
