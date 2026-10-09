import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import {
  getAdminStudentRequests,
  getAdminStudentRequestsCounts,
  getAdminDepartmentsList,
  getAdminInterestsList,
  updateStudentRequestStatus,
  batchUpdateStudentRequestStatus,
  updateStudentChecklistProgress,
  promoteInterestToRequest,
  batchPromoteInterestToRequests,
  getPublicSettings,
  initDb,
  saveDbAsync,
  hydrateFromMongoIfNeeded,
} from '@/lib/db';
import { isMongoConfigured } from '@/lib/mongodb';
import { sendStatusNotificationEmail } from '@/lib/email';
import { StudentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const formType = searchParams.get('form_type') || undefined;

  const [requests, counts, departments, interests, settings] = await Promise.all([
    getAdminStudentRequests(status, search, department, year, interest, formType),
    getAdminStudentRequestsCounts(),
    getAdminDepartmentsList(),
    getAdminInterestsList(),
    getPublicSettings(),
  ]);

  return NextResponse.json({
    success: true,
    requests,
    counts,
    departments,
    interests,
    statuses: settings.custom_statuses || [],
    checklist: settings.review_checklist || [],
    registration_open: settings.registration_open ?? true,
  });
}

export async function PATCH(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, id, ids, status, internal_notes, notify_student, email_note, registration_open } = body;

    // 1. Action: Toggle registration intake ON / OFF
    if (action === 'toggle_registration') {
      if (isMongoConfigured()) {
        await hydrateFromMongoIfNeeded();
      }
      const db = initDb();
      db.settings.registration_open = Boolean(registration_open);
      await saveDbAsync(db);
      return NextResponse.json({
        success: true,
        registration_open: db.settings.registration_open,
        message: `Public student registration is now ${db.settings.registration_open ? 'OPEN' : 'PAUSED (Interest Forms mode)'}.`,
      });
    }

    // 2. Action: Promote Interest Form(s) to active Request pipeline
    if (action === 'promote_interest') {
      const targetStatus: StudentStatus = status || 'NEW';
      if (Array.isArray(ids)) {
        if (ids.length === 0) {
          return NextResponse.json({ success: false, message: 'ids array cannot be empty.' }, { status: 400 });
        }
        const updatedList = await batchPromoteInterestToRequests(ids, targetStatus, internal_notes);
        return NextResponse.json({
          success: true,
          count: updatedList.length,
          requests: updatedList,
          message: `Successfully promoted ${updatedList.length} applicant(s) into active requests pipeline.`,
        });
      }

      if (!id) {
        return NextResponse.json({ success: false, message: 'id is required to promote interest form.' }, { status: 400 });
      }

      const updated = await promoteInterestToRequest(id, targetStatus, internal_notes);
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Student submission not found.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        request: updated,
        message: `${updated.full_name} has been promoted to active application (${targetStatus}).`,
      });
    }

    // 3. Action: Update Student Review Checklist Progress
    if (action === 'update_checklist' || body.checklist_progress !== undefined) {
      const studentId = id || body.requestId;
      if (!studentId) {
        return NextResponse.json({ success: false, message: 'Student ID is required to update checklist.' }, { status: 400 });
      }
      const updated = await updateStudentChecklistProgress(studentId, body.checklist_progress || {});
      if (!updated) {
        return NextResponse.json({ success: false, message: 'Student submission not found.' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        request: updated,
        message: 'Candidate verification checklist updated.',
      });
    }

    // 4. Regular Status Update (Single or Batch)
    if (!status || typeof status !== 'string') {
      return NextResponse.json({ success: false, message: 'Valid status is required.' }, { status: 400 });
    }

    const targetStatus: StudentStatus = status as StudentStatus;
    const settings = await getPublicSettings();

    // Batch update mode
    if (Array.isArray(ids)) {
      if (ids.length === 0) {
        return NextResponse.json({ success: false, message: 'ids array cannot be empty.' }, { status: 400 });
      }
      const updatedList = await batchUpdateStudentRequestStatus(ids, targetStatus, internal_notes);

      let emailsSent = 0;
      if (notify_student) {
        const results = await Promise.allSettled(
          updatedList.map((st) =>
            sendStatusNotificationEmail({
              student: st,
              newStatus: targetStatus,
              customNote: email_note || internal_notes,
              coeName: settings.coe_name,
              institutionName: settings.institution_name,
              contactEmail: settings.contact_email,
            })
          )
        );
        emailsSent = results.filter((r) => r.status === 'fulfilled' && r.value.sent).length;
      }

      return NextResponse.json({
        success: true,
        count: updatedList.length,
        requests: updatedList,
        emailsSent,
      });
    }

    // Single update mode
    if (!id) {
      return NextResponse.json({ success: false, message: 'Request ID or IDs array is required.' }, { status: 400 });
    }

    const updated = await updateStudentRequestStatus(id, targetStatus, internal_notes);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
    }

    let emailResult = null;
    if (notify_student) {
      emailResult = await sendStatusNotificationEmail({
        student: updated,
        newStatus: targetStatus,
        customNote: email_note || internal_notes,
        coeName: settings.coe_name,
        institutionName: settings.institution_name,
        contactEmail: settings.contact_email,
      });
    }

    return NextResponse.json({
      success: true,
      request: updated,
      email: emailResult,
    });
  } catch (err: any) {
    console.error('Error updating student request:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Failed to update request.' }, { status: 500 });
  }
}

// Student requests cannot be deleted; they can only be rejected or archived.
export async function DELETE(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: false,
    message: 'Student requests cannot be deleted. They can only be archived under status REJECTED.',
  }, { status: 400 });
}
