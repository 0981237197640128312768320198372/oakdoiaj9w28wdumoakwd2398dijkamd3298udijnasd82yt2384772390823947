// app/api/v3/seller/update-theme/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/models/v3/Seller';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { getAdminToken } from '@/lib/utils';

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const token = getAdminToken();
    // const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Decode token to get seller ID
    let sellerId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };
      sellerId = decoded._id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get seller from database
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      roundedness,
      primaryColor,
      secondaryColor,
      textColor,
      fontFamily,
      backgroundImage,
      buttonTextColor,
      buttonBgColor,
      buttonBorder,
      spacing,
      shadow,
      adsImageUrl,
    } = body;

    // Update theme settings
    seller.store.theme = {
      roundedness,
      primaryColor,
      secondaryColor,
      textColor,
      fontFamily,
      backgroundImage,
      buttonTextColor,
      buttonBgColor,
      buttonBorder,
      spacing,
      shadow,
      adsImageUrl,
    };

    await seller.save();

    return NextResponse.json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
