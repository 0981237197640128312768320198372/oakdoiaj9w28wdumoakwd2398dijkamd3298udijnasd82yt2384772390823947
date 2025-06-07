import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { BalanceService } from '@/lib/services/balanceService';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not set');
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof payload === 'string') {
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
      }
    } catch (err) {
      console.log('Token verification failed:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { buyer } = await request.json();
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer parameter missing' }, { status: 400 });
    }
    const jwtPayload = payload as JwtPayload;
    if (jwtPayload.username !== buyer && jwtPayload.email !== buyer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const buyerId = jwtPayload.id;
    if (!buyerId) {
      return NextResponse.json({ error: 'Invalid token: missing buyer ID' }, { status: 401 });
    }

    const balance = await BalanceService.getBalance(buyerId, 'buyer');

    return NextResponse.json({ balance });
  } catch (error) {
    console.log('Balance API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
