import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getEmailTemplates, updateEmailTemplates } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const templates = await getEmailTemplates();
  return NextResponse.json({ success: true, templates });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || !body.templates) {
      return NextResponse.json({ success: false, message: 'Missing templates object' }, { status: 400 });
    }

    const updated = await updateEmailTemplates(body.templates);
    return NextResponse.json({ success: true, templates: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to update templates' }, { status: 500 });
  }
}
