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

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    // Get query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const productId = url.searchParams.get('productId');

    // If ID is provided, get a specific digital inventory item
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
      }

      const inventory = await DigitalInventory.findOne({
        _id: id,
        sellerId,
      });

      if (!inventory) {
        return NextResponse.json({ error: 'Digital inventory not found' }, { status: 404 });
      }

      return NextResponse.json({ inventory });
    }

    // If productId is provided, get the digital inventory for that product
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
      }

      // First, verify the product exists and belongs to the seller
      const product = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Get the digital inventory for this product
      const inventory = await DigitalInventory.findOne({
        productId,
        sellerId,
      });

      if (!inventory) {
        return NextResponse.json(
          { error: 'No digital inventory found for this product' },
          { status: 404 }
        );
      }

      return NextResponse.json({ inventory, product });
    }

    // If no ID or productId is provided, get all digital inventory items for the seller
    const inventoryItems = await DigitalInventory.find({ sellerId });
    return NextResponse.json({ inventoryItems });
  } catch (error) {
    console.error('Error fetching digital inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { inventoryGroup, digitalAssets, assetKeys, productId } = body;

    if (!inventoryGroup) {
      return NextResponse.json({ error: 'Inventory group name is required' }, { status: 400 });
    }

    if (!Array.isArray(digitalAssets)) {
      return NextResponse.json({ error: 'Digital assets must be an array' }, { status: 400 });
    }

    // Create new digital inventory
    const newInventory = new DigitalInventory({
      sellerId,
      inventoryGroup,
      digitalAssets,
      assetKeys, // Add assetKeys to the model
      productId: productId || undefined,
    });

    await newInventory.save();

    // If productId is provided, update the product with the digital inventory ID
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (product) {
        product.digitalInventoryId = newInventory._id;
        await product.save();
      }
    }

    return NextResponse.json(
      {
        message: 'Digital inventory created successfully',
        inventory: newInventory,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating digital inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const body = await req.json();
    const { id, inventoryGroup, digitalAssets, assetKeys, productId } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    if (!inventoryGroup) {
      return NextResponse.json({ error: 'Inventory group name is required' }, { status: 400 });
    }

    if (!Array.isArray(digitalAssets)) {
      return NextResponse.json({ error: 'Digital assets must be an array' }, { status: 400 });
    }

    // Find the digital inventory to update
    const inventory = await DigitalInventory.findOne({
      _id: id,
      sellerId,
    });

    if (!inventory) {
      return NextResponse.json({ error: 'Digital inventory not found' }, { status: 404 });
    }

    // Update the digital inventory
    inventory.inventoryGroup = inventoryGroup;
    inventory.digitalAssets = digitalAssets;
    inventory.assetKeys = assetKeys; // Add assetKeys to the update

    // Handle product linking/unlinking
    const oldProductId = inventory.productId;
    inventory.productId = productId || undefined;

    await inventory.save();

    // If productId has changed, update the products
    if (oldProductId && oldProductId.toString() !== (productId || '')) {
      // Unlink from old product
      const oldProduct = await Product.findOne({
        _id: oldProductId,
        sellerId,
      });

      if (oldProduct && oldProduct.digitalInventoryId?.toString() === id) {
        oldProduct.digitalInventoryId = undefined;
        oldProduct._stock = await (Product as any).calculateStock(oldProductId);
        await oldProduct.save();
      }
    }

    // Link to new product if provided
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (product) {
        product.digitalInventoryId = inventory._id;
        product._stock = await (Product as any).calculateStock(productId);
        await product.save();
      }
    }

    return NextResponse.json(
      {
        message: 'Digital inventory updated successfully',
        inventory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating digital inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    // Authentication
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    // Get query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    // Find the digital inventory to delete
    const inventory = await DigitalInventory.findOne({
      _id: id,
      sellerId,
    });

    if (!inventory) {
      return NextResponse.json({ error: 'Digital inventory not found' }, { status: 404 });
    }

    // If this inventory is linked to a product, unlink it
    if (inventory.productId) {
      const product = await Product.findOne({
        _id: inventory.productId,
        sellerId,
      });

      if (product && product.digitalInventoryId?.toString() === id) {
        product.digitalInventoryId = undefined;
        await product.save();
      }
    }

    // Delete the digital inventory
    await DigitalInventory.deleteOne({ _id: id, sellerId });

    return NextResponse.json(
      {
        message: 'Digital inventory deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting digital inventory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
