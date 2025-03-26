/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Help from '../../../models/Help';
import { connectToDatabase } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { action, help, id, updatedHelp, helpId, stepIndex, newStep, updatedStep } =
      await request.json();

    if (action === 'add') {
      if (!help) {
        return NextResponse.json({ error: 'Missing help data for add action' }, { status: 400 });
      }
      const newHelp = new Help(help);
      await newHelp.save();
      return NextResponse.json({
        message: 'Operation successful',
        helps: [newHelp],
      });
    } else if (action === 'update') {
      if (!id || !updatedHelp) {
        return NextResponse.json(
          { error: 'Missing id or updatedHelp data for update action' },
          { status: 400 }
        );
      }
      const updated = await Help.findOneAndUpdate({ id }, updatedHelp, { new: true });
      if (!updated) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }
      return NextResponse.json({
        message: 'Operation successful',
        helps: [updated],
      });
    } else if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Missing id for delete action' }, { status: 400 });
      }
      const deleted = await Help.findOneAndDelete({ id });
      if (!deleted) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }
      return NextResponse.json({
        message: 'Operation successful',
        helps: [],
      });
    } else if (action === 'addStep') {
      if (!helpId || !newStep) {
        return NextResponse.json(
          { error: 'Missing helpId or newStep data for addStep action' },
          { status: 400 }
        );
      }
      const help = await Help.findOne({ id: helpId });
      if (!help) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }
      help.steps.push(newStep);
      await help.save();
      return NextResponse.json({
        message: 'Operation successful',
        helps: [help],
      });
    } else if (action === 'updateStep') {
      if (helpId === undefined || stepIndex === undefined || !updatedStep) {
        return NextResponse.json(
          {
            error: 'Missing helpId, stepIndex, or updatedStep data for updateStep action',
          },
          { status: 400 }
        );
      }
      const help = await Help.findOne({ id: helpId });
      if (!help) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }
      if (stepIndex < 0 || stepIndex >= help.steps.length) {
        return NextResponse.json({ error: 'Invalid step index' }, { status: 400 });
      }
      help.steps[stepIndex] = { ...help.steps[stepIndex], ...updatedStep };
      await help.save();
      return NextResponse.json({
        message: 'Operation successful',
        helps: [help],
      });
    } else if (action === 'deleteStep') {
      if (helpId === undefined || stepIndex === undefined) {
        return NextResponse.json(
          { error: 'Missing helpId or stepIndex data for deleteStep action' },
          { status: 400 }
        );
      }
      const help = await Help.findOne({ id: helpId });
      if (!help) {
        return NextResponse.json({ error: 'Help not found' }, { status: 404 });
      }
      if (stepIndex < 0 || stepIndex >= help.steps.length) {
        return NextResponse.json({ error: 'Invalid step index' }, { status: 400 });
      }
      help.steps.splice(stepIndex, 1);
      await help.save();
      return NextResponse.json({
        message: 'Operation successful',
        helps: [help],
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling helps:', error);
    return NextResponse.json({ error: 'Failed to handle helps operation' }, { status: 500 });
  }
}
