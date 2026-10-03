import { NextResponse } from 'next/server';
import { getPublicIndustry } from '@/lib/db';

export async function GET() {
  const industry = getPublicIndustry();
  return NextResponse.json({ success: true, industry });
}
