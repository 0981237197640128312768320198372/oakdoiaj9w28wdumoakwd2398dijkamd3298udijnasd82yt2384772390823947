import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Review } from '@/models/v3/Review';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const productIdsParam = searchParams.get('productIds');
    const type = searchParams.get('type'); // 'stats' only for now

    if (!productIdsParam) {
      return NextResponse.json({ error: 'productIds parameter is required' }, { status: 400 });
    }

    if (type !== 'stats') {
      return NextResponse.json(
        { error: 'Only stats type is supported for batch requests' },
        { status: 400 }
      );
    }

    // Parse product IDs
    const productIds = productIdsParam.split(',').filter((id) => id.trim());

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'No valid product IDs provided' }, { status: 400 });
    }

    if (productIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 products allowed per batch request' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const validObjectIds = productIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (validObjectIds.length === 0) {
      return NextResponse.json({ error: 'No valid product IDs provided' }, { status: 400 });
    }

    // Aggregate review stats for all products in one query
    const batchStats = await Review.aggregate([
      {
        $match: {
          productId: { $in: validObjectIds },
          reviewType: 'product',
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$productId',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratings: { $push: '$rating' },
        },
      },
    ]);

    // Create a map of product stats
    const statsMap: Record<
      string,
      {
        averageRating: number;
        totalReviews: number;
        ratingDistribution: Record<string, number>;
      }
    > = {};

    // Initialize all products with default stats
    validObjectIds.forEach((productId) => {
      statsMap[productId.toString()] = {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      };
    });

    // Fill in actual stats
    batchStats.forEach((stat) => {
      const productId = stat._id.toString();
      const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

      // Calculate rating distribution
      stat.ratings.forEach((rating: number) => {
        ratingDistribution[rating.toString() as keyof typeof ratingDistribution]++;
      });

      statsMap[productId] = {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        totalReviews: stat.totalReviews,
        ratingDistribution,
      };
    });

    return NextResponse.json({
      success: true,
      data: statsMap,
      count: validObjectIds.length,
    });
  } catch (error) {
    console.error('Error in batch reviews API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
