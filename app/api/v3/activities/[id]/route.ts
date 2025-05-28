/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { Activity } from '@/models/v3/Activity';
import { connectToDatabase } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { error } from 'console';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const activityId = params.id;
    console.log('////////////////////////////////\n');
    console.log(activityId);
    console.log('////////////////////////////////\n');

    const activity = await Activity.findById(activityId).populate({
      path: 'actors.secondary.id',
      select: 'username store.name store.logoUrl',
      model: 'Seller',
    });

    if (!activity) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 });
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
  } catch (error) {
    console.error('Fetch activity error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching activity' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const activityId = params.id;
    const body = await request.json();

    const activity = await Activity.findById(activityId);

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

    const updatedActivity = await Activity.findByIdAndUpdate(activityId, updates, { new: true });
    if (updatedActivity === null) {
      throw error('no updated activity founded');
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const userId = authResult.userId;
    const activityId = params.id;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return NextResponse.json({ success: false, message: 'Activity not found' }, { status: 404 });
    }

    const hasAccess = activity.actors.primary.id.toString() === userId;

    if (!hasAccess) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    await Activity.findByIdAndUpdate(activityId, {
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
