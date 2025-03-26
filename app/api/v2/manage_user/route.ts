import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { action, userData } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'show':
        const users = await User.find({});
        return NextResponse.json({ users });

      case 'add':
        if (
          !userData ||
          !userData.username ||
          !userData.password ||
          !userData.name ||
          !userData.role
        ) {
          return NextResponse.json({ error: 'All user fields are required' }, { status: 400 });
        }
        const newUser = new User(userData);
        await newUser.save();
        return NextResponse.json({ message: 'User added', user: newUser });

      case 'update':
        if (!userData || !userData._id) {
          return NextResponse.json({ error: 'User ID is required for update' }, { status: 400 });
        }
        const updatedUser = await User.findByIdAndUpdate(userData._id, userData, { new: true });
        if (!updatedUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User updated', user: updatedUser });

      case 'delete':
        if (!userData || !userData._id) {
          return NextResponse.json({ error: 'User ID is required for deletion' }, { status: 400 });
        }
        const deletedUser = await User.findByIdAndDelete(userData._id);
        if (!deletedUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User deleted' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing user:', error);
    return NextResponse.json({ error: 'Failed to manage user' }, { status: 500 });
  }
}
