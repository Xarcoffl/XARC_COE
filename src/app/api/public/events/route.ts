import { NextRequest, NextResponse } from 'next/server';
import { getPublicEvents } from '@/lib/db';
import { EventStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as EventStatus) || undefined;
  const events = getPublicEvents(status);
  return NextResponse.json({ success: true, events });
}
