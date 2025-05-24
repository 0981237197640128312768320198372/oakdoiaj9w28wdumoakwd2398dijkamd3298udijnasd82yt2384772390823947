import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const username = body.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required in the request body' },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({ username }).select('-password').select('-email').lean();

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }
    return NextResponse.json({ seller });
  } catch (error) {
    console.error('Error fetching seller:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    // Extract and verify token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };

    // Find seller by ID from token
    const seller = await Seller.findById(decoded._id);
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Parse JSON data
    const body = await req.json();
    const {
      storeName,
      storeDescription,
      email,
      password,
      facebook,
      line,
      instagram,
      whatsapp,
      logoUrl,
    } = body;

    // Update seller fields
    seller.store.name = storeName || seller.store.name;
    seller.store.description = storeDescription || seller.store.description;
    seller.email = email || seller.email;
    if (password) {
      seller.password = await bcrypt.hash(password, 10);
    }
    seller.contact.facebook = facebook ? `fb.com/${facebook}` : seller.contact.facebook;
    seller.contact.line = line ? `@${line}` : seller.contact.line;
    seller.contact.instagram = instagram ? `@${instagram}` : seller.contact.instagram;
    seller.contact.whatsapp = whatsapp || seller.contact.whatsapp;

    if (logoUrl) {
      seller.store.logoUrl = logoUrl;
    }

    await seller.save();

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
