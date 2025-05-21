import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const { username, password, personalKey } = await req.json();

  if (!username && !personalKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  try {
    let user;

    if (personalKey) {
      user = await User.findOne({ personalKey });
    } else if (username && password) {
      user = await User.findOne({ username });
      if (user && !(await bcrypt.compare(password, user.password))) {
        user = null;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, roles: user.roles },
      process.env.JWT_SECRET as string,
      { expiresIn: '6h' }
    );

    const redirectUrl = user.roles.includes('seller') ? '/app' : 'app';

    return NextResponse.json({ token, redirectUrl });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
