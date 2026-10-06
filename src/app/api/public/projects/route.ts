import { NextRequest, NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const projects = await getPublicProjects(category);
  return NextResponse.json({ success: true, projects });
}
