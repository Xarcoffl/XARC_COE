import { NextRequest, NextResponse } from 'next/server';
import { getPublicProjects } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const projects = getPublicProjects(category);
  return NextResponse.json({ success: true, projects });
}
