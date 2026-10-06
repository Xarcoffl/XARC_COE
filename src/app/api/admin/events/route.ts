import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDbAsync, calculateEventStatus, hydrateFromMongoIfNeeded } from '@/lib/db';
import { isMongoConfigured } from '@/lib/mongodb';
import { EventItem } from '@/lib/types';

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

  const db = initDb();
  const events = db.events.map((e) => ({
    ...e,
    status: calculateEventStatus(e.start_date, e.end_date),
  }));

  return NextResponse.json({ success: true, events });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      slug,
      title: body.title,
      category: body.category || 'Workshop',
      poster: body.poster || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
      start_date: body.start_date,
      end_date: body.end_date || body.start_date,
      time: body.time || '09:00 AM – 04:00 PM',
      venue: body.venue || 'AR/VR CoE Block',
      registration_url: body.registration_url || '',
      short_desc: body.short_desc || '',
      full_desc: body.full_desc || '',
      highlights: Array.isArray(body.highlights) ? body.highlights : (body.highlights || '').split('\n').filter(Boolean),
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      is_featured: Boolean(body.is_featured),
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.events.unshift(newEvent);
    await saveDbAsync(db);

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
  } catch (err) {
    console.error('Error creating event:', err);
    return NextResponse.json({ success: false, message: 'Failed to create event.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    const idx = db.events.findIndex((e) => e.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    db.events[idx] = {
      ...db.events[idx],
      ...body,
      highlights: Array.isArray(body.highlights) ? body.highlights : (body.highlights || '').split('\n').filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    await saveDbAsync(db);
    return NextResponse.json({ success: true, event: db.events[idx] });
  } catch (err) {
    console.error('Error updating event:', err);
    return NextResponse.json({ success: false, message: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
  }

  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  db.events = db.events.filter((e) => e.id !== id);
  await saveDbAsync(db);

  return NextResponse.json({ success: true, message: 'Event removed.' });
}
