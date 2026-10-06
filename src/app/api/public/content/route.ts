import { NextRequest, NextResponse } from 'next/server';
import { getPublicHomeContent, getPublicAboutContent, getPublicRequestContent } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');

  const [requestContent, homeContent, aboutContent] = await Promise.all([
    getPublicRequestContent(),
    getPublicHomeContent(),
    getPublicAboutContent(),
  ]);

  if (section === 'request') {
    return NextResponse.json({ success: true, request: requestContent, content: requestContent });
  } else if (section === 'home') {
    return NextResponse.json({ success: true, home: homeContent, content: homeContent });
  } else if (section === 'about') {
    return NextResponse.json({ success: true, about: aboutContent, content: aboutContent });
  }

  // Return all public content configurations
  return NextResponse.json({
    success: true,
    request: requestContent,
    home: homeContent,
    about: aboutContent,
  });
}
