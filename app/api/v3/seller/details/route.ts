import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import path from 'path';

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

    // Parse form data
    const formData = await req.formData();
    const storeName = formData.get('storeName') as string;
    const storeDescription = formData.get('storeDescription') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const facebook = formData.get('facebook') as string;
    const line = formData.get('line') as string;
    const instagram = formData.get('instagram') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const logo = formData.get('logo');

    // Handle logo file upload
    let logoUrl = seller.store.logoUrl;
    if (logo instanceof File) {
      const fileName = `${Date.now()}-${logo.name}`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      const arrayBuffer = await logo.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      logoUrl = `/uploads/${fileName}`;
    }

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
    seller.store.logoUrl = logoUrl;

    await seller.save();

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
