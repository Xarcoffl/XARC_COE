import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'home';
  const db = initDb();

  if (section === 'home') {
    return NextResponse.json({ success: true, content: db.home_content });
  } else if (section === 'about') {
    return NextResponse.json({ success: true, content: db.about_content });
  } else if (section === 'request') {
    return NextResponse.json({ success: true, content: db.request_content });
  }

  return NextResponse.json({ success: false, message: 'Invalid section' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { section, content } = await req.json();
    const db = initDb();

    if (section === 'home') {
      db.home_content = content;
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Home content updated successfully.' });
    } else if (section === 'about') {
      db.about_content = content;
      saveDb(db);
      return NextResponse.json({ success: true, message: 'About content updated successfully.' });
    } else if (section === 'request') {
      db.request_content = content;
      saveDb(db);
      return NextResponse.json({ success: true, message: 'Request form content updated successfully.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid section specified.' }, { status: 400 });
  } catch (err) {
    console.error('Error saving content:', err);
    return NextResponse.json({ success: false, message: 'Failed to update content.' }, { status: 500 });
  }
}
