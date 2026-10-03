import { NextRequest, NextResponse } from 'next/server';
import { getPublicAchievements } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const achievements = getPublicAchievements(category);
  return NextResponse.json({ success: true, achievements });
}
