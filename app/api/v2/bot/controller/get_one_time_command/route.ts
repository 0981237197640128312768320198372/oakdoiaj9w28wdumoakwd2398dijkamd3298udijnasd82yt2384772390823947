import { getAndClearOneTimeCommand } from '@/lib/state';
import { NextResponse } from 'next/server';

export async function GET() {
  const command = getAndClearOneTimeCommand();
  return NextResponse.json(command || { message: 'No command' });
}
