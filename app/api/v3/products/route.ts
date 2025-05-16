import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Product } from '@/models/v3/Product';

// Authentication helper function
function authenticate(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: 'Missing token', status: 401 };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { sellerId: string };
    return { sellerId: decoded.sellerId };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// POST /api/products - Create a new product
export async function POST(req: NextRequest) {
  try {
    // Authenticate seller
    const authResult = authenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    // Parse request body
    const body = await req.json();
    const { title, description, stock, type, details, categoryId, price, images, status } = body;

    // Validate required fields
    if (!title || !description || stock === undefined || !type || !categoryId || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate categoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
    }

    // Create new product
    const newProduct = new Product({
      title,
      description,
      stock,
      type,
      details: details || {},
      sellerId,
      categoryId,
      price,
      images: images || [],
      status: status || 'draft',
    });

    // Save to database
    const savedProduct = await newProduct.save();

    // Return success response
    return NextResponse.json(
      { message: 'Product created successfully', product: savedProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
