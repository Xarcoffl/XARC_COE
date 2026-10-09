import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { sendDiagnosticTestEmail, getSmtpConfigSummary } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const summary = getSmtpConfigSummary();
  return NextResponse.json({ success: true, summary, config: summary });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const recipient = (body.to || body.recipient || admin.email || '').trim();

    const result = await sendDiagnosticTestEmail(recipient, admin.name || admin.email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Diagnostic test email sent successfully to ${recipient}.`,
        messageId: result.messageId,
        latencyMs: result.latencyMs,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || 'SMTP test transmission failed.',
        latencyMs: result.latencyMs,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err?.message || 'Internal server error during SMTP test.',
    }, { status: 500 });
  }
}
