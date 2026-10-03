import { NextResponse } from 'next/server';
import { getPublicVerticals } from '@/lib/db';

export async function GET() {
  const verticals = getPublicVerticals();
  return NextResponse.json({ success: true, verticals });
}
