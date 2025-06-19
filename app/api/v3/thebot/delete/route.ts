/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteBot, getBot, addBotActivity } from '@/lib/botDatabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/v3/thebot/delete?botId=<botId>
 * Delete a specific bot
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ success: false, error: 'Bot ID is required' }, { status: 400 });
    }

    // Check if bot exists
    const bot = await getBot(botId);
    if (!bot) {
      return NextResponse.json({ success: false, error: 'Bot not found' }, { status: 404 });
    }

    // Safety check: Only allow deletion of stopped or idle bots
    if (bot.botState === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete running bot. Please stop the bot first.',
        },
        { status: 400 }
      );
    }

    // Add deletion activity log before removing
    await addBotActivity(botId, {
      _id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'state_change',
      message: 'Bot scheduled for deletion',
      status: 'completed',
    });

    // Delete the bot
    await deleteBot(botId);

    return NextResponse.json({
      success: true,
      message: `Bot ${botId} has been successfully deleted`,
    });
  } catch (error) {
    console.error('Error deleting bot:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete bot' }, { status: 500 });
  }
}
