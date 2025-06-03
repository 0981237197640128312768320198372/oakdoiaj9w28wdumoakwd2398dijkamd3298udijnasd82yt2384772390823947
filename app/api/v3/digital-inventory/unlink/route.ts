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
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Verify the digital inventory exists and belongs to the seller
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

    // Get the product ID before unlinking
    const productId = inventory.productId;

    if (!productId) {
      return NextResponse.json(
        { error: 'Inventory is not linked to any product' },
        { status: 400 }
      );
    }

    // Unlink the digital inventory from the product
    inventory.productId = undefined;
    await inventory.save();

    // Update the product to remove the digitalInventoryId
    const product = await Product.findOne({
      _id: productId,
      sellerId,
    });

    if (product && product.digitalInventoryId?.toString() === variantId) {
      product.digitalInventoryId = undefined;
      product._stock = 0; // Reset stock to 0 since there's no inventory
      await product.save();
    }

    return NextResponse.json(
      {
        message: 'Product unlinked successfully',
        inventory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unlinking product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
