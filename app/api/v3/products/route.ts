import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Product } from '@/models/v3/Product';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';

function jwtAuthenticate(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: 'Missing token', status: 401 };
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };
    return { sellerId: decoded._id };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// POST: Create a new product with image URLs
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const body = await req.json();
    const {
      title,
      description,
      stock,
      type,
      details,
      categoryId,
      price,
      discountPercentage = 0,
      images,
      status,
    } = body;

    if (
      !title ||
      !description ||
      stock === undefined ||
      !type ||
      !categoryId ||
      price === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
    }

    // Calculate discounted price
    const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

    const newProduct = new Product({
      title,
      description,
      stock,
      type,
      details,
      sellerId,
      categoryId,
      price,
      discountPercentage,
      discountedPrice,
      images: images || [], // Expecting an array of image URLs
      status: status || 'draft',
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json(
      { message: 'Product created successfully', product: savedProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch products for the authenticated seller
// export async function GET(req: NextRequest) {
//   try {
//     await connectToDatabase();
//     const authResult = jwtAuthenticate(req);
//     if ('error' in authResult) {
//       return NextResponse.json({ error: authResult.error }, { status: authResult.status });
//     }
//     const sellerId = authResult.sellerId;
//     const products = await Product.find({ sellerId }).lean();
//     return NextResponse.json({ products });
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;
    const products = await Product.find({ sellerId }).lean();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update an existing product
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const body = await req.json();
    const {
      id,
      title,
      description,
      stock,
      type,
      categoryId,
      price,
      discountPercentage = 0,
      images,
      status,
      details,
    } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 });
    }

    // Update product fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (type) product.type = type;
    if (details) product.details = details;

    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
      }
      const objectId = new mongoose.Types.ObjectId(categoryId);
      product.categoryId = objectId;
    }

    if (price !== undefined) product.price = price;
    if (discountPercentage !== undefined) {
      product.discountPercentage = discountPercentage;
      // Calculate discounted price
      product.discountedPrice =
        discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;
    }

    if (images) product.images = images; // Expecting an array of image URLs
    if (status) product.status = status;

    const updatedProduct = await product.save();

    return NextResponse.json(
      { message: 'Product updated successfully', product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a product
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 });
    }

    await Product.deleteOne({ _id: id });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
