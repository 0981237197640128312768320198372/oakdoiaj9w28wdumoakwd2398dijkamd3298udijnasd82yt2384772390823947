import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { BalanceService } from '@/lib/services/balanceService';
// Import only what we need

export async function POST(request: Request) {
  try {
    // Retrieve the JWT from the Authorization header ("Bearer <token>")
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token using JWT_SECRET from environment variables
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
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse the JSON body to extract buyer (username or email)
    const { buyer } = await request.json();
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer parameter missing' }, { status: 400 });
    }

    // Validate that the buyer provided matches either the username or email in the token payload
    const jwtPayload = payload as JwtPayload;
    if (jwtPayload.username !== buyer && jwtPayload.email !== buyer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get buyer ID from JWT payload
    const buyerId = jwtPayload.id;
    if (!buyerId) {
      return NextResponse.json({ error: 'Invalid token: missing buyer ID' }, { status: 401 });
    }

    // Retrieve the buyer's balance using the service function with the ID from JWT
    const balance = await BalanceService.getBalance(buyerId, 'buyer');

    return NextResponse.json({ balance });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
