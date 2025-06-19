import { NextResponse } from 'next/server';
import { botRegistry } from '@/lib/botDatabase';

export async function GET() {
  try {
    const registry = botRegistry || {};

    // Convert registry to array with additional info
    const bots = Object.entries(registry).map(([botId, info]) => ({
      botId,
      webhookUrl: info.webhookUrl,
      status: info.status,
      lastSeen: info.lastSeen,
      parameters: info.parameters,
      isOnline: info.lastSeen ? Date.now() - info.lastSeen.getTime() < 120000 : false, // 2 minutes
    }));

    return NextResponse.json({
      success: true,
      registeredBots: bots.length,
      onlineBots: bots.filter((bot) => bot.isOnline).length,
      bots,
    });
  } catch (error) {
    console.error(`Error getting bot registry:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get bot registry' },
      { status: 500 }
    );
  }
}
