import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/v3/Product';
import { DigitalInventory } from '@/models/v3/DigitalInventory';
import Seller from '@/models/Seller';

interface InventoryAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  count: number;
  products?: string[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find seller by username
    const seller = await Seller.findOne({ username });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Get all products for this seller
    const products = await Product.find({ sellerId: seller._id }).select(
      'title status _stock digitalInventoryId'
    );

    const alerts: InventoryAlert[] = [];

    // Calculate stock for each product and categorize alerts
    const outOfStockProducts: string[] = [];
    const lowStockProducts: string[] = [];
    const draftProducts: string[] = [];
    const unlinkedProducts: string[] = [];

    for (const product of products) {
      // Check for draft products
      if (product.status === 'draft') {
        draftProducts.push(product.title);
        continue;
      }

      // Calculate actual stock
      let actualStock = 0;
      if (product.digitalInventoryId) {
        // For digital products, calculate stock from digital inventory
        const digitalInventories = await DigitalInventory.find({ productId: product._id });
        let totalItems = 0;
        digitalInventories.forEach((inventory) => {
          const assets = inventory.digitalAssets;
          if (Array.isArray(assets)) {
            totalItems += assets.length;
          }
        });
        actualStock = totalItems;
      } else {
        // For regular products, use _stock field
        actualStock = product._stock || 0;
      }

      // Check stock levels
      if (actualStock === 0) {
        outOfStockProducts.push(product.title);
      } else if (actualStock <= 5) {
        // Low stock threshold
        lowStockProducts.push(product.title);
      }

      // Check for unlinked inventory (products without digital inventory when they should have it)
      if (!product.digitalInventoryId && product._stock === 0) {
        unlinkedProducts.push(product.title);
      }
    }

    // Create alerts based on findings
    if (outOfStockProducts.length > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'critical',
        message: 'products out of stock',
        count: outOfStockProducts.length,
        products: outOfStockProducts.slice(0, 5), // Limit to first 5 for display
      });
    }

    if (lowStockProducts.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        message: 'products low stock (≤5 items)',
        count: lowStockProducts.length,
        products: lowStockProducts.slice(0, 5),
      });
    }

    if (unlinkedProducts.length > 0) {
      alerts.push({
        id: 'unlinked',
        type: 'info',
        message: 'products need inventory setup',
        count: unlinkedProducts.length,
        products: unlinkedProducts.slice(0, 5),
      });
    }

    if (draftProducts.length > 0) {
      alerts.push({
        id: 'drafts',
        type: 'info',
        message: 'draft products ready to publish',
        count: draftProducts.length,
        products: draftProducts.slice(0, 5),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        summary: {
          totalProducts: products.length,
          outOfStock: outOfStockProducts.length,
          lowStock: lowStockProducts.length,
          drafts: draftProducts.length,
          unlinked: unlinkedProducts.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
