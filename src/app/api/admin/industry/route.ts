import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDb } from '@/lib/db';
import { IndustryRecord } from '@/lib/types';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const db = initDb();
  return NextResponse.json({ success: true, industry_records: db.industry_records });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = initDb();

    const newRecord: IndustryRecord = {
      id: `ind-${Date.now()}`,
      name: body.name,
      category: body.category || 'Partner',
      logo: body.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
      description: body.description || '',
      date_or_term: body.date_or_term || 'Active',
      collaboration_details: body.collaboration_details || '',
      key_outcomes: Array.isArray(body.key_outcomes) ? body.key_outcomes : (body.key_outcomes || '').split('\n').filter(Boolean),
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      order_index: db.industry_records.length + 1,
    };

    db.industry_records.push(newRecord);
    saveDb(db);

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (err) {
    console.error('Error creating industry record:', err);
    return NextResponse.json({ success: false, message: 'Failed to create industry record.' }, { status: 500 });
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

    const idx = db.industry_records.findIndex((r) => r.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    db.industry_records[idx] = {
      ...db.industry_records[idx],
      ...body,
      key_outcomes: Array.isArray(body.key_outcomes) ? body.key_outcomes : (body.key_outcomes || '').split('\n').filter(Boolean),
    };

    saveDb(db);
    return NextResponse.json({ success: true, record: db.industry_records[idx] });
  } catch (err) {
    console.error('Error updating industry record:', err);
    return NextResponse.json({ success: false, message: 'Failed to update industry record.' }, { status: 500 });
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
    return NextResponse.json({ success: false, message: 'Record ID required' }, { status: 400 });
  }

  const db = initDb();
  db.industry_records = db.industry_records.filter((r) => r.id !== id);
  saveDb(db);

  return NextResponse.json({ success: true, message: 'Industry record removed.' });
}
