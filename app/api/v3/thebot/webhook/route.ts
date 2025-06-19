/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import {
  registerBot,
  addBotActivity,
  updateBotActivity,
  updateBot,
  botRegistry,
} from '@/lib/botDatabase';

/**
 * POST /api/v3/thebot/webhook
 * Handle bot registration and reports
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const receivedSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.WEBHOOK_SECRET || 'KONTOL';

    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret received');
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    const body = await request.json();
    const { botId, action } = body;

    if (!botId) {
      return NextResponse.json({ error: 'Missing botId' }, { status: 400 });
    }

    console.log(`[Webhook] Received ${action} from bot ${botId}`);

    switch (action) {
      case 'register':
        await handleBotRegistration(body);
        break;

      case 'report':
        await handleBotReport(body);
        break;

      default:
        console.log(`[Webhook] Unknown action: ${action}`);
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleBotRegistration(body: any) {
  const { botId, webhookUrl } = body;

  if (!webhookUrl) {
    throw new Error('Missing webhookUrl for registration');
  }

  console.log(`[Webhook] Registering bot ${botId} with webhook ${webhookUrl}`);

  // Register bot in database and memory
  await registerBot(botId, webhookUrl);

  console.log(`[Webhook] Bot ${botId} registered successfully`);
}

async function handleBotReport(body: any) {
  const { botId, type, botState, message, activityId, status, output, error } = body;

  // Update bot registry with last seen
  if (botRegistry[botId]) {
    botRegistry[botId].lastSeen = new Date();
    if (botState) {
      botRegistry[botId].status = botState;
    }
  }

  switch (type) {
    case 'state_change':
      // Update bot state in database
      if (botState) {
        await updateBot(botId, { botState });
        console.log(`[Webhook] Updated bot ${botId} state to ${botState}`);
      }

      // Add activity log
      await addBotActivity(botId, {
        _id: `act_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'state_change',
        message,
      });
      break;

    case 'command_update':
      // Update specific command activity
      if (activityId) {
        const updateData: any = {};
        if (status) updateData.status = status;
        if (output) updateData.output = output;
        if (error) updateData.error = error;
        if (message) updateData.message = message;

        await updateBotActivity(botId, activityId, updateData);
        console.log(`[Webhook] Updated command ${activityId} for bot ${botId}`);
      }
      break;

    case 'error':
      // Log error activity
      await addBotActivity(botId, {
        _id: `act_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'error',
        message,
        details: { error },
      });
      console.log(`[Webhook] Logged error for bot ${botId}: ${message}`);
      break;

    default:
      console.log(`[Webhook] Unknown report type: ${type}`);
  }
}
