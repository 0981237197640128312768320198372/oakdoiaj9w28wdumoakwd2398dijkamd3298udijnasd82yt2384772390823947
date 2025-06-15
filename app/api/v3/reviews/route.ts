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

      case 'seller':
        if (sellerId) {
          const sellerReviews = await ReviewService.getSellerReviews(sellerId, { page, limit });
          return NextResponse.json({ data: sellerReviews });
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
          try {
            const productStats = await Promise.race([
              ReviewService.getProductRatingStats(productId),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 8000)
              ),
            ]);
            return NextResponse.json({ data: productStats });
          } catch (error) {
            console.error('Error fetching product rating stats:', error);
            // Return default stats on timeout/error
            return NextResponse.json({
              data: {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
              },
            });
          }
        } else if (sellerId) {
          try {
            const sellerStats = await Promise.race([
              ReviewService.getSellerRatingStats(sellerId),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 8000)
              ),
            ]);
            return NextResponse.json({ data: sellerStats });
          } catch (error) {
            console.error('Error fetching seller rating stats:', error);
            // Return default stats on timeout/error
            return NextResponse.json({
              data: { averageRating: 0, totalReviews: 0 },
            });
          }
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
    const { orderId, buyerId, sellerId, rating, comment } = body;

    if (!buyerId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle different review types
    if (type === 'product') {
      // Product reviews require orderId
      if (!orderId) {
        return NextResponse.json(
          { error: 'orderId is required for product reviews' },
          { status: 400 }
        );
      }

      const review = await ReviewService.submitReview({
        orderId,
        buyerId,
        reviewType: 'product',
        rating,
        comment,
      });

      return NextResponse.json({
        success: true,
        data: review,
      });
    } else if (type === 'seller') {
      // Store reviews require sellerId and purchase verification
      if (!sellerId) {
        return NextResponse.json(
          { error: 'sellerId is required for store reviews' },
          { status: 400 }
        );
      }

      const review = await ReviewService.submitStoreReview({
        buyerId,
        sellerId,
        rating,
        comment,
      });

      return NextResponse.json({
        success: true,
        data: review,
      });
    } else {
      return NextResponse.json({ error: 'Invalid review type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error submitting review:', error);

    if (error instanceof Error) {
      // Better error handling for duplicate submissions
      if (error.message.includes('already submitted')) {
        return NextResponse.json({ error: error.message }, { status: 409 }); // Conflict
      }
      if (error.message.includes('must purchase')) {
        return NextResponse.json({ error: error.message }, { status: 403 }); // Forbidden
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
