/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/models/v3/Activity';
import { connectToDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { Types } from 'mongoose';

// GET - Fetch activities with filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);

    // Query parameters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const skip = Number.parseInt(searchParams.get('skip') || '0');
    const userType = searchParams.get('userType') || 'buyer'; // buyer or seller

    // Build query
    const query: any = {};

    if (userType === 'buyer') {
      query['actors.primary.id'] = userId;
    } else {
      query.$or = [{ 'actors.primary.id': userId }, { 'actors.secondary.id': userId }];
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
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
      actors: activity.actors,
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

// POST - Create new activity
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const body = await request.json();

    const {
      type,
      category,
      status = 'pending',
      metadata = {},
      references = {},
      visibility = 'private',
      secondaryActorId,
      secondaryActorType,
      tags = [],
      priority = 'medium',
      notes,
    } = body;

    if (!type || !category) {
      return NextResponse.json(
        { success: false, message: 'Type and category are required' },
        { status: 400 }
      );
    }

    // Create activity
    const activityData: any = {
      type,
      category,
      status,
      metadata,
      references: {},
      visibility,
      actors: {
        primary: {
          id: new Types.ObjectId(userId),
          type: 'buyer', // Assuming buyer for now, can be dynamic
        },
      },
      tags,
      priority,
      notes,
    };

    // Add secondary actor if provided
    if (secondaryActorId && secondaryActorType) {
      activityData.actors.secondary = {
        id: new Types.ObjectId(secondaryActorId),
        type: secondaryActorType,
      };
    }

    // Convert references to ObjectIds
    if (references) {
      for (const [key, value] of Object.entries(references)) {
        if (value && typeof value === 'string') {
          activityData.references[key] = new Types.ObjectId(value);
        }
      }
    }

    const activity = await Activity.create(activityData);

    return NextResponse.json({
      success: true,
      message: 'Activity created successfully',
      activity: {
        id: activity._id,
        type: activity.type,
        category: activity.category,
        status: activity.status,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      },
    });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating activity' },
      { status: 500 }
    );
  }
}
