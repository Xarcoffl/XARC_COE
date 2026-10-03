import { NextResponse } from 'next/server';
import { getPublicSettings } from '@/lib/db';

export async function GET() {
  const settings = getPublicSettings();
  return NextResponse.json({ success: true, settings });
}
