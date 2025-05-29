/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const channelSecret = process.env.CHANNEL_SECRET || 'asd';

async function handleEvent(event: any) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    console.log(`User ID received: ${userId}`);
  }
}

export async function POST(req: any) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const bodyBuffer = Buffer.from(bodyText, 'utf-8');

    const computedSignature = crypto
      .createHmac('sha256', channelSecret)
      .update(bodyBuffer)
      .digest('base64');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(bodyText);

    await Promise.all(body.events.map(handleEvent));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
