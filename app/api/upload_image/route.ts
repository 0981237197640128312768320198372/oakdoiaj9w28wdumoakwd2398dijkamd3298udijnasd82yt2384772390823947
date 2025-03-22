import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const { gridFSBucket } = await connectToDatabase();
    const downloadStream = gridFSBucket.openDownloadStream(new ObjectId(id));

    downloadStream.on('error', () => {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    });

    return new NextResponse(downloadStream, {
      headers: {
        'Content-Type': 'image/jpeg', // Adjust based on actual file type if available
      },
    });
  } catch (error) {
    console.error('Error in get_image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
