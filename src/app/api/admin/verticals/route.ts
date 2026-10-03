import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDb } from '@/lib/db';
import { Vertical } from '@/lib/types';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const db = initDb();
  return NextResponse.json({ success: true, verticals: db.verticals });
}

export async function PUT(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = initDb();

    const idx = db.verticals.findIndex((v) => v.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Vertical not found' }, { status: 404 });
    }

    db.verticals[idx] = {
      ...db.verticals[idx],
      ...body,
      outcomes: Array.isArray(body.outcomes) ? body.outcomes : (body.outcomes || '').split('\n').filter(Boolean),
      tools: Array.isArray(body.tools) ? body.tools : (body.tools || '').split(',').map((t: string) => t.trim()),
      opportunities: Array.isArray(body.opportunities) ? body.opportunities : (body.opportunities || '').split(',').map((o: string) => o.trim()),
    };

    saveDb(db);
    return NextResponse.json({ success: true, vertical: db.verticals[idx] });
  } catch (err) {
    console.error('Error updating vertical:', err);
    return NextResponse.json({ success: false, message: 'Failed to update vertical.' }, { status: 500 });
  }
}
