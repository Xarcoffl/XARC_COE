import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getAdminStudentRequests } from '@/lib/db';
import { sendCohortAnnouncementEmail } from '@/lib/email';
import { StudentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const targetStatusRaw = body.target_status || body.audience || 'JOINED';
    const targetDeptRaw = body.target_department || body.department || 'ALL';
    const targetGroupId = body.target_group_id || (typeof targetStatusRaw === 'string' && targetStatusRaw.startsWith('GROUP:') ? targetStatusRaw.replace('GROUP:', '') : undefined);

    const {
      subject,
      badge,
      headline,
      message,
      custom_note,
      action_label,
      action_url,
    } = body;

    if (!subject || !headline || !message) {
      return NextResponse.json({
        success: false,
        message: 'Subject, headline, and message body are required.',
      }, { status: 400 });
    }

    const deptFilter = targetDeptRaw === 'ALL' ? undefined : targetDeptRaw;

    let allRequests: any[] = [];
    let groupName = '';

    if (targetGroupId) {
      const { getCustomStudentGroups } = await import('@/lib/db');
      const groups = await getCustomStudentGroups();
      const group = groups.find((g) => g.id === targetGroupId);
      if (!group) {
        return NextResponse.json({
          success: false,
          message: `Target student group "${targetGroupId}" was not found.`,
        }, { status: 404 });
      }
      groupName = group.name;
      const rawRequests = await getAdminStudentRequests(undefined, undefined, deptFilter);
      allRequests = rawRequests.filter((r) => Array.isArray(group.student_ids) && group.student_ids.includes(r.id));
    } else {
      const statusFilter = targetStatusRaw === 'ALL' ? undefined : (targetStatusRaw as StudentStatus);
      allRequests = await getAdminStudentRequests(statusFilter, undefined, deptFilter);
    }

    // Extract valid recipients
    const recipients = allRequests
      .map((r) => ({
        email: (r.email || r.college_email || '').trim(),
        name: r.full_name,
      }))
      .filter((r) => r.email && r.email.includes('@'));

    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No student candidates found matching the target audience filters.',
      }, { status: 404 });
    }

    const broadcastResult = await sendCohortAnnouncementEmail({
      recipients,
      subject,
      badge,
      headline,
      message,
      customNote: custom_note,
      actionLabel: action_label,
      actionUrl: action_url,
      sentBy: admin.name || admin.email,
    });

    return NextResponse.json({
      success: true,
      message: groupName
        ? `Broadcast to group "${groupName}" complete: ${broadcastResult.sentCount} sent, ${broadcastResult.failedCount} failed out of ${broadcastResult.totalCount} recipients.`
        : `Broadcast complete: ${broadcastResult.sentCount} sent, ${broadcastResult.failedCount} failed out of ${broadcastResult.totalCount} recipients.`,
      target_group: groupName || undefined,
      ...broadcastResult,
    });
  } catch (err: any) {
    console.error('Broadcast announcement error:', err);
    return NextResponse.json({
      success: false,
      message: err?.message || 'Failed to process cohort broadcast.',
    }, { status: 500 });
  }
}
