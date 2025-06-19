import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/lib/botDatabase';

/**
 * GET /api/v3/thebot/activity?botId=bot-123&limit=50
 * Get bot activity logs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const botId = searchParams.get('botId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

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

    // Get recent activity (latest first)
    const activity = bot.activity || [];
    const recentActivity = activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      botId,
      activity: recentActivity,
      total: activity.length,
      returned: recentActivity.length,
    });
  } catch (error) {
    console.error(`Error getting bot activity:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to get bot activity' },
      { status: 500 }
    );
  }
}
