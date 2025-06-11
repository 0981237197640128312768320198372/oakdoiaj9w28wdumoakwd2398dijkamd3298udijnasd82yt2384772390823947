/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/models/v3/Activity';
import { connectToDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { Types } from 'mongoose';

// GET - Fetch activities (list or specific activity)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const activity = await Activity.findById(id).populate({
        path: 'actors.secondary.id',
        select: 'username store.name store.logoUrl',
        model: 'Seller',
      });

      if (!activity) {
        return NextResponse.json(
          { success: false, message: 'Activity not found' },
          { status: 404 }
        );
      }

      const hasAccess =
        activity.actors.primary.id.toString() === userId ||
        (activity.actors.secondary && activity.actors.secondary.id.toString() === userId);

      if (!hasAccess) {
        return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        activity: {
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
        },
      });
    } else {
      const category = searchParams.get('category');
      const type = searchParams.get('type');
      const status = searchParams.get('status');
      const search = searchParams.get('search');
      const limit = parseInt(searchParams.get('limit') || '20');
      const skip = parseInt(searchParams.get('skip') || '0');

      const userType = searchParams.get('userType') || 'buyer';

      const query: any = {};

      if (userType === 'buyer') {
        query['actors.primary.id'] = new Types.ObjectId(userId);
      } else {
        query.$or = [
          { 'actors.primary.id': new Types.ObjectId(userId) },
          { 'actors.secondary.id': new Types.ObjectId(userId) },
        ];
      }

      if (category) query.category = category;
      if (type) query.type = type;
      if (status) query.status = status;

      // Add search functionality
      if (search) {
        const searchConditions = [
          { 'metadata.productName': { $regex: search, $options: 'i' } },
          { 'metadata.orderNumber': { $regex: search, $options: 'i' } },
          { 'metadata.description': { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
        ];

        if (query.$or) {
          // If we already have $or conditions (for user access), combine them with AND
          query.$and = [{ $or: query.$or }, { $or: searchConditions }];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

      // Get total count for pagination
      const total = await Activity.countDocuments(query);

      const activities = await Activity.find(query)
        .populate({
          path: 'actors.secondary.id',
          select: 'username store.name store.logoUrl',
          model: 'Seller',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

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
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      });
    }
  } catch (error) {
    console.error('Fetch activities error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching activities' },
      { status: 500 }
    );
  }
}

// POST - Create new activity (unchanged)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

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
          type: 'buyer',
        },
      },
      tags,
      priority,
      notes,
    };

    if (secondaryActorId && secondaryActorType) {
      activityData.actors.secondary = {
        id: new Types.ObjectId(secondaryActorId),
        type: secondaryActorType,
      };
    }

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

// PATCH - Update an activity
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 });
    }

    const hasAccess =
      activity.actors.primary.id.toString() === userId ||
      (activity.actors.secondary && activity.actors.secondary.id.toString() === userId);

    if (!hasAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const allowedUpdates = ['status', 'metadata', 'notes', 'tags', 'priority', 'completedAt'];
    const updates: any = {};

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (body.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    const updatedActivity = await Activity.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedActivity) {
      return NextResponse.json(
        { success: false, message: 'No updated activity found' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity updated successfully',
      activity: {
        id: updatedActivity._id,
        type: updatedActivity.type,
        category: updatedActivity.category,
        status: updatedActivity.status,
        metadata: updatedActivity.metadata,
        updatedAt: updatedActivity.updatedAt,
        completedAt: updatedActivity.completedAt,
      },
    });
  } catch (error) {
    console.error('Update activity error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating activity' },
      { status: 500 }
    );
  }
}

// DELETE - Mark an activity as cancelled
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();

    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 });
    }

    const hasAccess = activity.actors.primary.id.toString() === userId;

    if (!hasAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    await Activity.findByIdAndUpdate(id, {
      status: 'cancelled',
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while deleting activity' },
      { status: 500 }
    );
  }
}
