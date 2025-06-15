import { NextRequest, NextResponse } from 'next/server';
import { StoreCreditService } from '@/lib/services/storeCreditService';
import { jwtDecode } from 'jwt-decode';

interface BuyerToken {
  id: string;
  email: string;
  username?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const type = searchParams.get('type'); // 'stats' | 'user-credit' | 'recent'
    const limit = parseInt(searchParams.get('limit') || '10');
    const creditType = searchParams.get('creditType') as 'positive' | 'negative' | null;

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId is required' }, { status: 400 });
    }

    // Get buyer info from token if available
    let buyerId: string | null = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwtDecode<BuyerToken>(token);
        buyerId = decoded.id;
      } catch (error) {
        // Token invalid, continue without buyer info
      }
    }

    switch (type) {
      case 'stats':
        const stats = await StoreCreditService.getStoreCreditStats(sellerId);
        return NextResponse.json({ data: stats });

      case 'user-credit':
        if (!buyerId) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const userCredit = await StoreCreditService.getUserStoreCredit(buyerId, sellerId);
        return NextResponse.json({ data: userCredit });

      case 'recent':
        const recentCredits = await StoreCreditService.getRecentStoreCredits(sellerId, {
          limit,
          creditType: creditType || undefined,
        });
        return NextResponse.json({ data: recentCredits });

      case 'purchase-check':
        if (!buyerId) {
          return NextResponse.json({ data: { hasPurchased: false } });
        }
        const hasPurchased = await StoreCreditService.hasPurchasedFromSeller(buyerId, sellerId);
        const purchaseSummary = hasPurchased
          ? await StoreCreditService.getPurchaseSummary(buyerId, sellerId)
          : null;
        return NextResponse.json({
          data: {
            hasPurchased,
            purchaseSummary,
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in store credits GET API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get buyer info from token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let buyerId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = jwtDecode<BuyerToken>(token);
      buyerId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { sellerId, creditType } = body;

    if (!sellerId || !creditType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['positive', 'negative'].includes(creditType)) {
      return NextResponse.json({ error: 'Invalid credit type' }, { status: 400 });
    }

    const credit = await StoreCreditService.submitStoreCredit({
      buyerId,
      sellerId,
      creditType,
    });

    return NextResponse.json({
      success: true,
      data: credit,
    });
  } catch (error) {
    console.error('Error submitting store credit:', error);

    if (error instanceof Error) {
      if (error.message.includes('must purchase')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to submit store credit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get buyer info from token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let buyerId: string;
    try {
      const token = authHeader.substring(7);
      const decoded = jwtDecode<BuyerToken>(token);
      buyerId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId is required' }, { status: 400 });
    }

    const success = await StoreCreditService.removeStoreCredit(buyerId, sellerId);

    if (!success) {
      return NextResponse.json({ error: 'Store credit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing store credit:', error);
    return NextResponse.json({ error: 'Failed to remove store credit' }, { status: 500 });
  }
}
