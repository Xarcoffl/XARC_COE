import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const settings = await getPublicSettings();
  return NextResponse.json({ success: true, settings });
}
