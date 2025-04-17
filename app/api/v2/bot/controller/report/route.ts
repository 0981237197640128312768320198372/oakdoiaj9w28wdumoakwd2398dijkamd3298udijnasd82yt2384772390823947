import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const report = await request.json();
  console.log('Report received:', report);
  return NextResponse.json({ message: 'Report received' });
}
