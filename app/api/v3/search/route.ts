import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/v3/Product';
import { Seller } from '@/models/v3/Seller';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const store = searchParams.get('store');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    if (!store) {
      return NextResponse.json({ error: 'Store username is required' }, { status: 400 });
    }

    const seller = await Seller.findOne({ username: store });
    if (!seller) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const products = await Product.find({
      sellerId: seller._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
      ],
      status: 'active',
    }).limit(10);

    const sellerMatches =
      seller.store.name.toLowerCase().includes(query.toLowerCase()) ||
      seller.store.description.toLowerCase().includes(query.toLowerCase());

    const results = {
      seller: sellerMatches
        ? {
            id: seller._id,
            name: seller.store.name,
            description: seller.store.description,
            logoUrl: seller.store.logoUrl,
          }
        : null,
      products: products.map((product) => ({
        id: product._id,
        title: product.title,
        description: product.description,
        price: product.price,
        discountedPrice: product.discountedPrice,
        image: product.images[0] || null,
        type: product.type,
      })),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
