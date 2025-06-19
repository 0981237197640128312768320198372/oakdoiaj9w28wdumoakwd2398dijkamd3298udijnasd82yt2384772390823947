import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/botDatabase';

/**
 * GET /api/v3/thebot/commands?botId=bot-123
 * Get pending commands for a bot (for polling)
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

    // Find the latest pending command
    const pendingCommands =
      bot.activity?.filter(
        (activity) => activity.type === 'command' && activity.status === 'pending'
      ) || [];

    // Return the most recent pending command
    const latestCommand =
      pendingCommands.length > 0 ? pendingCommands[pendingCommands.length - 1] : null;

    if (latestCommand) {
      return NextResponse.json({
        success: true,
        command: latestCommand.command,
        _id: latestCommand._id,
      });
    } else {
      return NextResponse.json({
        success: true,
        command: null,
        _id: null,
      });
    }
  } catch (error) {
    console.error(`Error getting bot commands:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get bot commands' },
      { status: 500 }
    );
  }
}
