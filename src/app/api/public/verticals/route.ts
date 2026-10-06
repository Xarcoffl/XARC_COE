import { NextResponse } from 'next/server';
import { getPublicVerticals } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const verticals = await getPublicVerticals();
  return NextResponse.json({ success: true, verticals });
}
