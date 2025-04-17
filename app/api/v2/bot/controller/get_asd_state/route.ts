import { getAsdState } from '@/lib/state';
import { NextResponse } from 'next/server';

export async function GET() {
  const state = getAsdState();
  return NextResponse.json(state);
}
