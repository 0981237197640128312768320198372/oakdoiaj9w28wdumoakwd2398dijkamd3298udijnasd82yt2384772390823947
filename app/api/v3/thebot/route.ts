/* eslint-disable @typescript-eslint/no-unused-vars */
import { getBots } from '@/lib/botDatabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v3/thebot
 * Get all bots data
 */
export async function GET(request: NextRequest) {
  try {
    // Get all bots from database
    const bots = await getBots();

    return NextResponse.json({
      success: true,
      bots,
    });
  } catch (error) {
    console.error('Error getting bots data:', error);
    return NextResponse.json({ success: false, error: 'Failed to get bots data' }, { status: 500 });
  }
}
