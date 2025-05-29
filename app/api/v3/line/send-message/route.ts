import { NextRequest, NextResponse } from 'next/server';

interface SendMessageRequest {
  userId: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = (await request.json()) as SendMessageRequest;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing message' }, { status: 400 });
    }
    if (!/^U[0-9a-f]{32}$/.test(userId)) {
      return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Missing LINE_CHANNEL_ACCESS_TOKEN');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const url = 'https://api.line.me/v2/bot/message/push';
    const body = {
      to: userId,
      messages: [{ type: 'text', text: message }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API error:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Failed to send message' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
