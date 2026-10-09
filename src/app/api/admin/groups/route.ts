import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import {
  getCustomStudentGroups,
  saveCustomStudentGroup,
  deleteCustomStudentGroup,
} from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const groups = await getCustomStudentGroups();
    return NextResponse.json({ success: true, groups });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to fetch custom groups.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ success: false, message: 'Group name is required.' }, { status: 400 });
    }

    const saved = await saveCustomStudentGroup({
      id: body.id || undefined,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      color: body.color || '#06b6d4',
      student_ids: Array.isArray(body.student_ids) ? body.student_ids : [],
    });

    return NextResponse.json({ success: true, group: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to save custom group.' }, { status: 500 });
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
    return NextResponse.json({ success: false, message: 'Group ID is required.' }, { status: 400 });
  }

  try {
    const success = await deleteCustomStudentGroup(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Failed to delete custom group.' }, { status: 500 });
  }
}
