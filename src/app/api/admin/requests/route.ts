import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getAdminStudentRequests, updateStudentRequestStatus, deleteStudentRequest } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const department = searchParams.get('department') || undefined;
  const year = searchParams.get('year') || undefined;
  const interest = searchParams.get('interest') || undefined;

  const requests = getAdminStudentRequests(status, search, department, year, interest);
  return NextResponse.json({ success: true, requests });
}

export async function PATCH(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status, internal_notes } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Request ID and new status are required.' }, { status: 400 });
    }

    if (status !== 'NEW' && status !== 'WAITING' && status !== 'JOINED' && status !== 'REJECTED') {
      return NextResponse.json({ success: false, message: 'Invalid status. Must be NEW, WAITING, JOINED, or REJECTED.' }, { status: 400 });
    }

    const updated = updateStudentRequestStatus(id, status, internal_notes);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    console.error('Error updating student request:', err);
    return NextResponse.json({ success: false, message: 'Failed to update request.' }, { status: 500 });
  }
}

// Student requests cannot be deleted; they can only be rejected.
export async function DELETE(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: false,
    message: 'Student requests cannot be deleted. They can only be marked as REJECTED.',
  }, { status: 400 });
}
