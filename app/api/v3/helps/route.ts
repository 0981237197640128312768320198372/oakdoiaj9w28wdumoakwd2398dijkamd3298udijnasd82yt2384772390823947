/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Help } from '@/models/v3/Help';
import mongoose from 'mongoose';

// GET - Fetch all helps or a specific help by ID
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const fetchAll = searchParams.get('fetchall') === 'true';

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
      }

      const help = await Help.findById(id);
      if (!help) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }

      return NextResponse.json({ help });
    }

    if (fetchAll) {
      const helps = await Help.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ helps });
    }

    // Default pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const helps = await Help.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await Help.countDocuments({});

    return NextResponse.json({ helps, total, page, limit });
  } catch (error) {
    console.error('Error fetching helps:', error);
    return NextResponse.json({ error: 'Failed to fetch helps' }, { status: 500 });
  }
}

// POST - Create a new help or perform actions (add, update, delete, etc.)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { action, help, id, updatedHelp, helpId, stepIndex, newStep, updatedStep } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'add':
        if (!help) {
          return NextResponse.json({ error: 'Missing help data for add action' }, { status: 400 });
        }

        const newHelp = new Help({
          title: help.title,
          description: help.description,
          categories: help.categories || [],
          steps: help.steps || [],
        });

        await newHelp.save();
        return NextResponse.json({
          message: 'Help added successfully',
          helps: [newHelp],
        });

      case 'update':
        if (!id || !updatedHelp) {
          return NextResponse.json(
            { error: 'Missing id or updatedHelp data for update action' },
            { status: 400 }
          );
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
        }

        const updated = await Help.findByIdAndUpdate(id, updatedHelp, { new: true });
        if (!updated) {
          return NextResponse.json({ error: 'Help not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'Help updated successfully',
          helps: [updated],
        });

      case 'delete':
        if (!id) {
          return NextResponse.json({ error: 'Missing id for delete action' }, { status: 400 });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
        }

        const deleted = await Help.findByIdAndDelete(id);
        if (!deleted) {
          return NextResponse.json({ error: 'Help not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Help deleted successfully' });

      case 'addStep':
        if (!helpId || !newStep) {
          return NextResponse.json(
            { error: 'Missing helpId or newStep data for addStep action' },
            { status: 400 }
          );
        }

        if (!mongoose.Types.ObjectId.isValid(helpId)) {
          return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
        }

        const helpForAddStep = await Help.findById(helpId);
        if (!helpForAddStep) {
          return NextResponse.json({ error: 'Help not found' }, { status: 404 });
        }

        helpForAddStep.steps.push(newStep);
        await helpForAddStep.save();

        return NextResponse.json({
          message: 'Step added successfully',
          helps: [helpForAddStep],
        });

      case 'updateStep':
        if (!helpId || stepIndex === undefined || !updatedStep) {
          return NextResponse.json(
            { error: 'Missing helpId, stepIndex, or updatedStep data for updateStep action' },
            { status: 400 }
          );
        }

        if (!mongoose.Types.ObjectId.isValid(helpId)) {
          return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
        }

        const helpForUpdateStep = await Help.findById(helpId);
        if (!helpForUpdateStep) {
          return NextResponse.json({ error: 'Help not found' }, { status: 404 });
        }

        if (stepIndex < 0 || stepIndex >= helpForUpdateStep.steps.length) {
          return NextResponse.json({ error: 'Invalid step index' }, { status: 400 });
        }

        helpForUpdateStep.steps[stepIndex] = updatedStep;
        await helpForUpdateStep.save();

        return NextResponse.json({
          message: 'Step updated successfully',
          helps: [helpForUpdateStep],
        });

      case 'deleteStep':
        if (!helpId || stepIndex === undefined) {
          return NextResponse.json(
            { error: 'Missing helpId or stepIndex data for deleteStep action' },
            { status: 400 }
          );
        }

        if (!mongoose.Types.ObjectId.isValid(helpId)) {
          return NextResponse.json({ error: 'Invalid help ID' }, { status: 400 });
        }

        const helpForDeleteStep = await Help.findById(helpId);
        if (!helpForDeleteStep) {
          return NextResponse.json({ error: 'Help not found' }, { status: 404 });
        }

        if (stepIndex < 0 || stepIndex >= helpForDeleteStep.steps.length) {
          return NextResponse.json({ error: 'Invalid step index' }, { status: 400 });
        }

        helpForDeleteStep.steps.splice(stepIndex, 1);
        await helpForDeleteStep.save();

        return NextResponse.json({
          message: 'Step deleted successfully',
          helps: [helpForDeleteStep],
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing helps:', error);
    return NextResponse.json({ error: 'Failed to manage helps' }, { status: 500 });
  }
}
