import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDb } from '@/lib/db';
import { Achievement } from '@/lib/types';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const db = initDb();
  return NextResponse.json({ success: true, achievements: db.achievements });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = initDb();

    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: body.title,
      category: body.category || 'Hackathon',
      year: body.year || new Date().getFullYear().toString(),
      date: body.date || 'Recent',
      description: body.description || '',
      student_team: body.student_team || '',
      department: body.department || db.settings.institution_name || 'Department',
      image: body.image || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1000&auto=format&fit=crop',
      supporting_info: body.supporting_info || '',
      is_featured: Boolean(body.is_featured),
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: new Date().toISOString(),
    };

    db.achievements.unshift(newAch);
    saveDb(db);

    return NextResponse.json({ success: true, achievement: newAch }, { status: 201 });
  } catch (err) {
    console.error('Error creating achievement:', err);
    return NextResponse.json({ success: false, message: 'Failed to create achievement.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = initDb();

    const idx = db.achievements.findIndex((a) => a.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Achievement not found' }, { status: 404 });
    }

    db.achievements[idx] = {
      ...db.achievements[idx],
      ...body,
    };

    saveDb(db);
    return NextResponse.json({ success: true, achievement: db.achievements[idx] });
  } catch (err) {
    console.error('Error updating achievement:', err);
    return NextResponse.json({ success: false, message: 'Failed to update achievement.' }, { status: 500 });
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
    return NextResponse.json({ success: false, message: 'Achievement ID required' }, { status: 400 });
  }

  const db = initDb();
  db.achievements = db.achievements.filter((a) => a.id !== id);
  saveDb(db);

  return NextResponse.json({ success: true, message: 'Achievement removed.' });
}
