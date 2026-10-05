import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getAdminStudentRequests, updateStudentRequestStatus, batchUpdateStudentRequestStatus, deleteStudentRequest } from '@/lib/db';

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

  const requests = await getAdminStudentRequests(status, search, department, year, interest);
  return NextResponse.json({ success: true, requests });
}

export async function PATCH(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ids, status, internal_notes } = body;

    if (!['NEW', 'WAITING', 'JOINED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status. Must be NEW, WAITING, JOINED, or REJECTED.' }, { status: 400 });
    }

    // Batch update mode
    if (Array.isArray(ids)) {
      if (ids.length === 0) {
        return NextResponse.json({ success: false, message: 'ids array cannot be empty.' }, { status: 400 });
      }
      const updatedList = await batchUpdateStudentRequestStatus(ids, status, internal_notes);
      return NextResponse.json({ success: true, count: updatedList.length, requests: updatedList });
    }

    // Single update mode
    if (!id) {
      return NextResponse.json({ success: false, message: 'Request ID or IDs array is required.' }, { status: 400 });
    }

    const updated = await updateStudentRequestStatus(id, status, internal_notes);
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
