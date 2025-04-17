import { setOneTimeCommand } from '@/lib/state';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { command } = body;
  if (command) {
    setOneTimeCommand({ command });
    return NextResponse.json({ message: 'One-time command set', command });
  }
  return NextResponse.json({ message: 'Invalid command' }, { status: 400 });
}
