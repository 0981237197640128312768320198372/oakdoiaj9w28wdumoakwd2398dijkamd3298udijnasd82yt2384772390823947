import { addBotActivity, getBot } from '@/lib/botDatabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botId = searchParams.get('botId');
    console.log(searchParams);
    console.log(botId);
    // Validate botId
    if (!botId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: botId' },
        { status: 400 }
      );
    }

    const { command } = await request.json();

    // Validate required fields
    if (!command) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: command' },
        { status: 400 }
      );
    }

    // Get bot data
    const bot = await getBot(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
    }

    // Get bot's webhook URL from database (more reliable than global registry)
    if (!bot.webhookUrl) {
      console.log(`❌ Bot ${botId} has no webhook URL registered`);
      return NextResponse.json(
        { success: false, error: 'Bot is not registered with webhook' },
        { status: 400 }
      );
    }

    console.log(`✅ Using webhook URL from database: ${bot.webhookUrl}`);

    // Generate command ID
    const commandId = `cmd_${Date.now()}`;

    // Record command in activity log
    await addBotActivity(botId, {
      _id: commandId,
      timestamp: new Date().toISOString(),
      type: 'command',
      command,
      status: 'pending',
      message: `Command sent: ${command}`,
    });

    // Send webhook to bot controller
    const webhookResponse = await fetch(bot.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.WEBHOOK_SECRET || 'KONTOL',
      },
      body: JSON.stringify({
        botId,
        action: 'execute_command',
        command,
        commandId,
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Failed to send webhook: ${webhookResponse.statusText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Command sent to bot',
      commandId,
    });
  } catch (error) {
    console.log(`Error sending command:`, error);
    return NextResponse.json({ success: false, error: 'Failed to send command' }, { status: 500 });
  }
}
