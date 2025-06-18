/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  botRegistry,
  registerBot,
  getBot,
  updateBot,
  addBotActivity,
  updateBotActivity,
} from '../../../../../lib/botDatabase';

// Webhook secret for verification
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'KONTOL';

// Types
interface WebhookPayload {
  botId: string;
  action: 'register' | 'report' | 'heartbeat';
  webhookUrl?: string;
  secret?: string;
  type?: string;
  botState?: 'idle' | 'running' | 'error' | 'stopped';
  message?: string;
  activityId?: string;
  status?: 'in-progress' | 'completed' | 'failed';
  output?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Handle all webhook requests
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body: WebhookPayload = await request.json();
    const { botId, action } = body;

    // Validate request
    if (!botId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'register':
        return handleRegistration(body);

      case 'report':
        return handleReport(body);

      case 'heartbeat':
        return handleHeartbeat(body);

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle bot registration
 */
async function handleRegistration(payload: WebhookPayload) {
  const { botId, webhookUrl, secret } = payload;

  // Validate request
  if (!webhookUrl) {
    return NextResponse.json({ success: false, error: 'Missing webhookUrl' }, { status: 400 });
  }

  // Validate secret
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 403 });
  }

  // Register the bot
  await registerBot(botId, webhookUrl);

  console.log(`Bot ${botId} registered with webhook URL: ${webhookUrl}`);

  return NextResponse.json({ success: true });
}

/**
 * Handle bot status reports
 */
async function handleReport(payload: WebhookPayload) {
  // Verify webhook secret
  const headersList = await headers();
  const authHeader = headersList.get('x-webhook-secret');

  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { botId, type, botState, message, activityId, status, output, error: errorMsg } = payload;

  // Update bot registry
  if (botRegistry[botId]) {
    botRegistry[botId].lastSeen = new Date();

    if (botState) {
      botRegistry[botId].status = botState;
      // Update bot state in database
      await updateBot(botId, { botState });
    }

    // Handle different report types
    switch (type) {
      case 'state_change':
        // Add activity to bot history
        await addBotActivity(botId, {
          _id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'state_change',
          message: message || `Bot state changed to ${botState}`,
        });
        break;

      case 'command_update':
        if (activityId) {
          // Update existing command activity
          const updateData: any = {
            status,
            timestamp: new Date().toISOString(),
          };

          if (output) updateData.output = output;
          if (errorMsg) updateData.error = errorMsg;
          if (message) updateData.message = message;

          await updateBotActivity(botId, activityId, updateData);
        }
        break;

      case 'error':
        // Add error activity
        await addBotActivity(botId, {
          _id: `act_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'error',
          message: message || 'An error occurred',
          error: errorMsg,
        });
        break;
    }

    console.log(`Bot ${botId} status update: ${botState || 'N/A'} - ${message || 'No message'}`);
  } else {
    console.log(`Update received for unregistered bot ${botId}`);
  }

  return NextResponse.json({ success: true });
}

/**
 * Handle bot heartbeat
 */
async function handleHeartbeat(payload: WebhookPayload) {
  // Verify webhook secret
  const headersList = await headers();
  const authHeader = headersList.get('x-webhook-secret');

  if (authHeader !== WEBHOOK_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }

  const { botId } = payload;

  // Update last seen timestamp
  if (botRegistry[botId]) {
    botRegistry[botId].lastSeen = new Date();
    console.log(`Heartbeat received from bot ${botId}`);
  } else {
    console.log(`Heartbeat received from unregistered bot ${botId}`);
  }

  return NextResponse.json({ success: true });
}

/**
 * Get bot state or send commands
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botId = searchParams.get('botId');
    const command = searchParams.get('command');

    // Validate request
    if (!botId) {
      return NextResponse.json(
        { success: false, error: 'Missing botId parameter' },
        { status: 400 }
      );
    }

    // Get bot data
    const bot = await getBot(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
    }

    // If command is specified, send it to the bot
    if (command) {
      return sendCommandToBot(botId, command);
    }

    // Otherwise, return bot state
    return NextResponse.json({
      botId,
      botState: bot.botState,
      parameters: bot.parameters || [],
      lastSeen: botRegistry[botId]?.lastSeen || null,
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Send command to bot
 */
async function sendCommandToBot(botId: string, command: string) {
  // Check if bot is registered
  if (!botRegistry[botId]?.webhookUrl) {
    return NextResponse.json(
      { success: false, error: 'Bot not registered with webhook' },
      { status: 400 }
    );
  }

  try {
    // Parse command
    let action: string;
    let parameters: string[] = [];
    let commandStr: string | undefined;

    if (command.startsWith('start')) {
      action = 'start';
      parameters = command.replace('start', '').trim().split(' ').filter(Boolean);
    } else if (command === 'stop') {
      action = 'stop';
    } else if (command === 'install_bot') {
      action = 'install_bot';
    } else {
      action = 'execute_command';
      commandStr = command;
    }

    // Generate command ID
    const commandId = `cmd_${Date.now()}`;

    // Record command in activity log
    await addBotActivity(botId, {
      _id: commandId,
      timestamp: new Date().toISOString(),
      type: 'command',
      command: commandStr || command,
      status: 'pending',
      message: `Command sent: ${commandStr || command}`,
    });

    // Send webhook to bot controller
    const response = await fetch(botRegistry[botId].webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        botId,
        action,
        parameters,
        command: commandStr,
        commandId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send webhook: ${response.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: `Command sent to bot`,
      commandId,
    });
  } catch (error) {
    console.error(`Error sending command to bot ${botId}:`, error);

    // Record error in activity log
    await addBotActivity(botId, {
      _id: `err_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `Failed to send command to bot: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    });

    return NextResponse.json(
      { success: false, error: 'Failed to send command to bot' },
      { status: 500 }
    );
  }
}
