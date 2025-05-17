import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const url = await uploadImage(file);
      return url;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
