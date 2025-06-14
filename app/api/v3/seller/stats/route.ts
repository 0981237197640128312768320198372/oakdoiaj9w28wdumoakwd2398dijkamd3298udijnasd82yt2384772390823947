import { NextRequest, NextResponse } from 'next/server';
import { SellerStatsService } from '@/lib/services/sellerStatsService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    // Get seller statistics
    const statistics = await SellerStatsService.getSellerStatistics(username);

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Error fetching seller statistics:', error);

    if (error instanceof Error && error.message === 'Seller not found') {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
