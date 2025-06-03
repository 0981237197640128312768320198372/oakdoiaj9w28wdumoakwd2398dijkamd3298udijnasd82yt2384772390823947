/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { DigitalInventory } from '@/models/v3/DigitalInventory';
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

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const body = await req.json();
    const { variantId, productId } = body;

    if (!variantId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (
      !mongoose.Types.ObjectId.isValid(variantId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const product = await Product.findOne({
      _id: productId,
      sellerId,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 });
    }

    const inventory = await DigitalInventory.findOne({
      _id: variantId,
      sellerId,
    });

    if (!inventory) {
      return NextResponse.json(
        { error: 'Digital inventory not found or not authorized' },
        { status: 404 }
      );
    }

    inventory.productId = new mongoose.Types.ObjectId(productId);
    await inventory.save();

    product.digitalInventoryId = new mongoose.Types.ObjectId(variantId);
    await product.save();

    const variants = await DigitalInventory.find({ productId }).lean();
    const totalStock = variants.reduce((sum, inv) => {
      return sum + (Array.isArray(inv.digitalAssets) ? inv.digitalAssets.length : 0);
    }, 0);
    product._stock = totalStock;
    await product.save();

    return NextResponse.json(
      {
        message: 'Product linked successfully',
        inventory,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error linking product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
