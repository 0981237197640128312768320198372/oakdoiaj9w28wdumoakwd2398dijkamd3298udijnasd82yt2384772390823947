/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/models/v3/Activity';
import { connectToDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const buyerId = authResult.userId;
    const { searchParams } = new URL(request.url);

    // Query parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const skip = Number.parseInt(searchParams.get('skip') || '0');

    // Build query
    const query: any = {
      'actors.primary.id': buyerId,
    };

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    // Fetch activities
    const activities = await Activity.find(query)
      .populate({
        path: 'actors.secondary.id',
        select: 'username store.name store.logoUrl',
        model: 'Seller',
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Activity.countDocuments(query);

    // Format activities for frontend
    const formattedActivities = activities.map((activity) => ({
      id: activity._id,
      type: activity.type,
      category: activity.category,
      status: activity.status,
      metadata: activity.metadata,
      references: activity.references,
      visibility: activity.visibility,
      actors: {
        primary: activity.actors.primary,
        secondary: activity.actors.secondary
          ? {
              ...activity.actors.secondary,
              // Add populated seller data if available
              seller: activity.actors.secondary.id,
            }
          : undefined,
      },
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      completedAt: activity.completedAt,
      tags: activity.tags,
      priority: activity.priority,
      notes: activity.notes,
    }));

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Fetch activities error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching activities' },
      { status: 500 }
    );
  }
}
