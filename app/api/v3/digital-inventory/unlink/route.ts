/* eslint-disable @typescript-eslint/no-unused-vars */
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
      return NextResponse.json({ error: 'Missing variant ID' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return NextResponse.json({ error: 'Invalid variant ID' }, { status: 400 });
    }

    // Verify the variant exists and belongs to the seller
    const variant = await DigitalInventory.findOne({
      _id: variantId,
      sellerId,
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found or not authorized' }, { status: 404 });
    }

    // Get the product ID before unlinking
    const productId = variant.productId;

    // Unlink the variant from the product
    variant.productId = undefined;
    await variant.save();

    // If there was a linked product, update it to remove the productDataId
    if (productId) {
      const product = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (product && product.productDataId?.toString() === variantId) {
        product.productDataId = undefined;
        await product.save();
      }

      // Recalculate stock and persist on Product
      const variantsAfter = await DigitalInventory.find({ productId }).lean();
      const totalStockAfter = variantsAfter.reduce((sum, inv) => {
        const assets = inv.digitalAssets || inv.specifications;
        return sum + (Array.isArray(assets) ? assets.length : 1);
      }, 0);
      product._stock = totalStockAfter;
      await product.save();
    }

    return NextResponse.json(
      {
        message: 'Product unlinked successfully',
        variant,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unlinking product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
