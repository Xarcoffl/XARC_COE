import { NextResponse } from 'next/server';
import { getPublicIndustry } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const industry = await getPublicIndustry();
  return NextResponse.json({ success: true, industry });
}
