import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDbAsync, hydrateFromMongoIfNeeded } from '@/lib/db';
import { isMongoConfigured } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'home';
  const db = initDb();

  if (section === 'home') {
    return NextResponse.json({ success: true, content: db.home_content });
  } else if (section === 'about') {
    return NextResponse.json({ success: true, content: db.about_content });
  } else if (section === 'request') {
    const rc = { ...(db.request_content || {}) };
    if (db.settings?.departments && Array.isArray(db.settings.departments) && db.settings.departments.length > 0) {
      rc.departments = db.settings.departments;
    }
    if (db.settings?.interest_options && Array.isArray(db.settings.interest_options) && db.settings.interest_options.length > 0) {
      rc.interest_options = db.settings.interest_options;
    }
    return NextResponse.json({ success: true, content: rc });
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
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    if (section === 'home') {
      db.home_content = content;
      await saveDbAsync(db);
      return NextResponse.json({ success: true, message: 'Home content updated successfully.' });
    } else if (section === 'about') {
      db.about_content = content;
      await saveDbAsync(db);
      return NextResponse.json({ success: true, message: 'About content updated successfully.' });
    } else if (section === 'request') {
      db.request_content = content;
      if (content.departments && Array.isArray(content.departments)) {
        if (!db.settings) db.settings = {} as any;
        db.settings.departments = [...content.departments];
      }
      if (content.interest_options && Array.isArray(content.interest_options)) {
        if (!db.settings) db.settings = {} as any;
        db.settings.interest_options = [...content.interest_options];
      }
      await saveDbAsync(db);
      return NextResponse.json({ success: true, message: 'Request form content updated successfully.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid section specified.' }, { status: 400 });
  } catch (err) {
    console.error('Error saving content:', err);
    return NextResponse.json({ success: false, message: 'Failed to update content.' }, { status: 500 });
  }
}
