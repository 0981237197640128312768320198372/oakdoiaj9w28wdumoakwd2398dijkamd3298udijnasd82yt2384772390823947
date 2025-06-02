/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Product } from '@/models/v3/Product';
import { DigitalInventory } from '@/models/v3/DigitalInventory';
import { Seller } from '@/models/v3/Seller';
import { Category } from '@/models/v3/Category';
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
    const authResult = jwtAuthenticate(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const sellerId = authResult.sellerId;

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      price,
      discountPercentage = 0,
      images,
      status,
      productData,
    } = body;

    if (!title || !description || !categoryId || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 });
    }

    // Validate image count
    if (images && images.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 });
    }

    // Calculate discounted price
    const discountedPrice = discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price;

    const newProduct = new Product({
      title,
      description,
      sellerId,
      categoryId,
      price,
      discountPercentage,
      discountedPrice,
      images: images || [], // Expecting an array of image URLs
      status: status || 'draft',
    });

    const savedProduct = await newProduct.save();

    // Create ProductData entries if provided
    let productDataEntries = [];
    if (productData && Array.isArray(productData) && productData.length > 0) {
      const productDataPromises = productData.map(async (data) => {
        const newProductData = new DigitalInventory({
          productId: savedProduct._id,
          sellerId,
          variantName: data.variantName,
          specifications: data.specifications,
        });
        return newProductData.save();
      });

      productDataEntries = await Promise.all(productDataPromises);
    }

    // Get category data
    const category = await Category.findById(savedProduct.categoryId).lean();

    // Calculate stock based on ProductData entries
    const stock = productDataEntries.length;

    // Add virtual stock to the response
    const productWithStock = {
      ...savedProduct.toObject(),
      stock,
      category,
    };

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: productWithStock,
        productData: productDataEntries,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const countTotalProducts = searchParams.get('countTotalProducts');
    const categoryId = searchParams.get('categoryId');
    if (countTotalProducts) {
      const sellerFromCount = await Seller.findOne({ username: countTotalProducts });
      if (!sellerFromCount) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }
      let query: any = { sellerId: sellerFromCount._id };
      if (categoryId) {
        query.categoryId = categoryId;
      }
      const count = await Product.countDocuments(query);
      return NextResponse.json({ count });
    }

    const store = searchParams.get('store');
    const productId = searchParams.get('productId');
    let sellerId;

    if (store) {
      const seller = await Seller.findOne({ username: store });
      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      }
      sellerId = seller._id;
    } else {
      const authResult = jwtAuthenticate(req);
      if ('error' in authResult) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }
      sellerId = authResult.sellerId;
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
      }

      // Use explicit casting to handle the type
      const productDoc = await Product.findOne({
        _id: productId,
        sellerId,
      });

      if (!productDoc) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Convert to plain object
      const product = productDoc.toObject();

      // Get category data
      const category = await Category.findById(product.categoryId).lean();

      // Get associated ProductData entries
      const productDataEntries = await DigitalInventory.find({
        productId,
        sellerId,
      }).lean();

      // Calculate stock based on ProductData entries
      const stock = productDataEntries.length;

      return NextResponse.json({
        product: {
          ...product,
          stock,
          category,
          productData: productDataEntries,
        },
      });
    }

    let query: any = { sellerId };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Get products and convert to plain objects
    const products = await Product.find(query);
    const plainProducts = products.map((product) => product.toObject());

    const productsWithCategories = await Promise.all(
      plainProducts.map(async (product) => {
        // Get category data if categoryId exists
        let category = null;
        if (product.categoryId) {
          category = await Category.findById(product.categoryId).lean();
        }

        // Get stock count for each product
        const stockCount = await DigitalInventory.countDocuments({ productId: product._id });

        return {
          ...product,
          stock: stockCount,
          category,
        };
      })
    );
    return NextResponse.json({ products: productsWithCategories });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      categoryId,
      price,
      discountPercentage = 0,
      images,
      status,
      productData,
    } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Validate image count
    if (images && images.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 });
    }

    const product = await Product.findOne({ _id: id, sellerId });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or not authorized' }, { status: 404 });
    }

    if (title) product.title = title;
    if (description) product.description = description;

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

    // Handle ProductData updates if provided
    let productDataEntries = [];
    if (productData && Array.isArray(productData)) {
      // Delete existing ProductData entries
      await DigitalInventory.deleteMany({ productId: id, sellerId });

      // Create new ProductData entries
      if (productData.length > 0) {
        const productDataPromises = productData.map(async (data) => {
          const newProductData = new DigitalInventory({
            productId: id,
            sellerId,
            variantName: data.variantName,
            specifications: data.specifications,
          });
          return newProductData.save();
        });

        productDataEntries = await Promise.all(productDataPromises);
      }
    }

    // Get category data
    const category = await Category.findById(updatedProduct.categoryId).lean();

    // Calculate stock based on ProductData entries
    const stock =
      productDataEntries.length || (await DigitalInventory.countDocuments({ productId: id }));

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product: {
          ...updatedProduct.toObject(),
          stock,
          category,
        },
        productData: productDataEntries.length > 0 ? productDataEntries : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Delete associated ProductData entries
    await DigitalInventory.deleteMany({ productId: id, sellerId });

    // Delete the product
    await Product.deleteOne({ _id: id });

    return NextResponse.json(
      { message: 'Product and associated data deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
