/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { Seller } from '@/models/v3/Seller';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { uploadImage } from '@/lib/utils';

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const token = req.headers.get('Authorization')?.split(' ')[1];
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

    // Parse form data
    const formData = await req.formData();

    // Extract fields from form data
    const storeName = formData.get('storeName') as string;
    const storeDescription = formData.get('storeDescription') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const facebook = formData.get('facebook') as string;
    const line = formData.get('line') as string;
    const instagram = formData.get('instagram') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const logo = formData.get('logo') as File | null;

    // Update seller information
    if (storeName) seller.store.name = storeName;
    if (storeDescription) seller.store.description = storeDescription;
    if (email) seller.email = email;

    // Update password if provided
    if (password) {
      seller.password = await bcrypt.hash(password, 10);
    }

    // Update contact information
    seller.contact = {
      facebook: facebook ? `fb.com/${facebook}` : seller.contact.facebook,
      line: line ? `@${line}` : seller.contact.line,
      instagram: instagram ? `@${instagram}` : seller.contact.instagram,
      whatsapp: whatsapp || seller.contact.whatsapp,
    };

    // Upload and update logo if provided
    if (logo && logo.size > 0) {
      try {
        const logoUrl = await uploadImage(logo);
        seller.store.logoUrl = logoUrl;
      } catch (error) {
        console.error('Error uploading logo:', error);
        return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
      }
    }

    // Save updated seller
    await seller.save();

    // Generate new token with updated information
    const sellerObj = seller.toObject();
    const { password: _, ...sellerData } = sellerObj;

    const newToken = jwt.sign(sellerData, process.env.JWT_SECRET as string, {
      expiresIn: '2h',
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
