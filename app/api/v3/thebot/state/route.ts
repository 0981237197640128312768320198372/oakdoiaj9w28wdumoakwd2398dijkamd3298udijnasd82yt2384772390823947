import { NextRequest, NextResponse } from 'next/server';

// Import your database model or use direct DB connection
import { getBot, updateBot } from '@/lib/botDatabase';

/**
 * GET /api/v3/thebot/state?botId=bot-123
 * Get bot state (for polling)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botId = searchParams.get('botId');

    // Validate botId
    if (!botId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: botId' },
        { status: 400 }
      );
    }

    // Get bot data
    const bot = await getBot(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      botState: bot.botState,
      parameters: bot.parameters,
    });
  } catch (error) {
    console.error(`Error getting bot state:`, error);
    return NextResponse.json({ success: false, error: 'Failed to get bot state' }, { status: 500 });
  }
}

/**
 * POST /api/v3/thebot/state?botId=bot-123
 * Set bot state (running/stopped)
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botId = searchParams.get('botId');

    // Validate botId
    if (!botId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: botId' },
        { status: 400 }
      );
    }

    const { botState, parameters } = await request.json();

    // Validate required fields
    if (!botState) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: botState' },
        { status: 400 }
      );
    }

    // Validate botState value
    if (!['running', 'stopped', 'idle'].includes(botState)) {
      return NextResponse.json(
        { success: false, error: 'Invalid botState value' },
        { status: 400 }
      );
    }

    // Get bot data
    const bot = await getBot(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
    }

    // Get bot's webhook URL from registry
    const botRegistry = global.botRegistry || {};
    const botInfo = botRegistry[botId];

    if (!botInfo?.webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Bot is not registered with webhook' },
        { status: 400 }
      );
    }

    // Send webhook to bot controller
    const webhookResponse = await fetch(botInfo.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || 'KONTOL',
      },
      body: JSON.stringify({
        botId,
        action: botState === 'running' ? 'start' : 'stop',
        parameters: parameters || [],
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Failed to send webhook: ${webhookResponse.statusText}`);
    }

    // Update bot state in database
    await updateBot(botId, { botState, parameters });

    return NextResponse.json({
      success: true,
      message: `Bot state updated to ${botState}`,
    });
  } catch (error) {
    console.error(`Error setting bot state:`, error);
    return NextResponse.json({ success: false, error: 'Failed to set bot state' }, { status: 500 });
  }
}
