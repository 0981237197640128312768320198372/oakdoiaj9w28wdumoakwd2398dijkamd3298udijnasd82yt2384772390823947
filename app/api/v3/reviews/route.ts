import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/reviewService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const productId = searchParams.get('productId');
    const sellerId = searchParams.get('sellerId');
    const type = searchParams.get('type'); // 'pending' | 'product' | 'stats'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!buyerId && !productId && !sellerId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    switch (type) {
      case 'pending':
        if (!buyerId) {
          return NextResponse.json(
            { error: 'buyerId is required for pending reviews' },
            { status: 400 }
          );
        }
        const pendingReviews = await ReviewService.getPendingReviewsForBuyer(buyerId);
        return NextResponse.json({ data: pendingReviews });

      case 'product':
        if (productId) {
          const productReviews = await ReviewService.getProductReviews(productId, { page, limit });
          return NextResponse.json({ data: productReviews });
        } else if (buyerId) {
          const buyerProductReviews = await ReviewService.getBuyerReviews(buyerId, {
            page,
            limit,
            reviewType: 'product',
          });
          return NextResponse.json({ data: buyerProductReviews });
        }
        break;

      case 'submitted':
        // Legacy support - get all reviews by buyer (product only)
        if (buyerId) {
          const buyerReviews = await ReviewService.getBuyerReviews(buyerId, {
            page,
            limit,
            reviewType: 'product',
          });
          return NextResponse.json({ data: buyerReviews });
        }
        break;

      case 'stats':
        if (buyerId) {
          const buyerStats = await ReviewService.getReviewStats(buyerId);
          return NextResponse.json({ data: buyerStats });
        } else if (productId) {
          const productStats = await ReviewService.getProductRatingStats(productId);
          return NextResponse.json({ data: productStats });
        } else if (sellerId) {
          const sellerStats = await ReviewService.getSellerRatingStats(sellerId);
          return NextResponse.json({ data: sellerStats });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'product' | 'seller' | null;

    const body = await request.json();
    const { orderId, buyerId, rating, comment } = body;

    if (!orderId || !buyerId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SIMPLIFIED: Only allow product reviews
    if (type !== 'product') {
      return NextResponse.json(
        {
          error: 'Only product reviews are allowed. Seller reviews have been disabled.',
        },
        { status: 400 }
      );
    }

    const review = await ReviewService.submitReview({
      orderId,
      buyerId,
      reviewType: 'product', // Always product
      rating,
      comment,
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);

    if (error instanceof Error) {
      // Better error handling for duplicate submissions
      if (error.message.includes('already submitted')) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // Conflict
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
