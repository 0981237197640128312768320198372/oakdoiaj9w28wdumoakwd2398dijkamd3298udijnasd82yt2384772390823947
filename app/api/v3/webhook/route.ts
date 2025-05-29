import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    return NextResponse.json({ error: 'Channel secret is not set' }, { status: 500 });
  }

  const signature = request.headers.get('x-line-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await request.text();

  const computedSignature = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');

  if (computedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const data = JSON.parse(body);

  for (const event of data.events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const text = event.message.text.trim();
      if (text === '/register') {
        const userId = event.source.userId;
        console.log(`User ID to store: ${userId}`);
      }
    }
  }

  return NextResponse.json({ success: true });
}
