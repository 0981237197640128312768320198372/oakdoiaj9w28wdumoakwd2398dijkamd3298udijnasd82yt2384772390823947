/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Category } from '@/models/v3/Category';
import { connectToDatabase } from '@/lib/db';
import { uploadImage } from '@/lib/utils';
import jwt from 'jsonwebtoken';

// function authenticate(req: NextRequest) {
//   const token = req.headers.get('Authorization')?.split(' ')[1];
//   if (!token) {
//     return { error: 'Missing token', status: 401 };
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };
//     return { userId: decoded._id };
//   } catch (error) {
//     return { error: 'Invalid token', status: 401 };
//   }
// }

// POST: Create a new category with image upload
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    // const authResult = authenticate(req);
    // if ('error' in authResult) {
    //   return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    // }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const logoFile = formData.get('logo') as File | null;
    const parentId = formData.get('parentId') as string | null;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: name and description' },
        { status: 400 }
      );
    }

    let logoUrl = null;
    if (logoFile) {
      logoUrl = await uploadImage(logoFile);
    }

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return NextResponse.json({ error: 'Invalid parentId format' }, { status: 400 });
      }
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
      }
    }

    const newCategory = new Category({
      name,
      description,
      logoUrl,
      parentId: parentId || null,
    });
    const savedCategory = await newCategory.save();

    return NextResponse.json(
      { message: 'Category created successfully', category: savedCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch all categories or a single category by ID
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      }
      const category = await Category.findById(id);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ category });
    } else {
      const categories = await Category.find();
      return NextResponse.json({ categories });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update an existing category
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    // const authResult = authenticate(req);
    // if ('error' in authResult) {
    //   return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    // }

    const formData = await req.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const logoFile = formData.get('logo') as File | null;
    const parentId = formData.get('parentId') as string | null;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return NextResponse.json({ error: 'Invalid parentId format' }, { status: 400 });
      }
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 400 });
      }
      category.parentId = parentId;
    }

    if (logoFile) {
      category.logoUrl = await uploadImage(logoFile);
    }

    const updatedCategory = await category.save();

    return NextResponse.json(
      { message: 'Category updated successfully', category: updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove a category
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    // const authResult = authenticate(req);
    // if ('error' in authResult) {
    //   return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    // }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await Category.deleteOne({ _id: id });

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
