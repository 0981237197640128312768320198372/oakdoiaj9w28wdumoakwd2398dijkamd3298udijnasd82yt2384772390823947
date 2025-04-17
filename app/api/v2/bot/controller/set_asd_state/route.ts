import { setAsdState } from '@/lib/state';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { status, parameters } = body;
  if (status === 'running' || status === 'stopped') {
    setAsdState({ status, parameters });
    return NextResponse.json({ message: 'ASD state set', state: { status, parameters } });
  }
  return NextResponse.json({ message: 'Invalid state' }, { status: 400 });
}
