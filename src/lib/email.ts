import nodemailer, { Transporter } from 'nodemailer';
import { StudentRequest, StudentStatus, EmailTemplatesSettings } from './types';
import {
  getEmailTemplates,
  logEmailTransmission,
  getPublicSettings,
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_REQUEST_STATUSES,
} from './db';

export const DEFAULT_PRODUCTION_URL = 'https://coe.xarc.online';

export function getCanonicalSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_PRODUCTION_URL;
  return envUrl.replace(/\/+$/, '');
}

/**
 * Normalizes an action URL or route path so outbound email links reliably
 * resolve against the hosted domain (https://coe.xarc.online) with zero host mismatch.
 * - Extracts relative paths from localhost / test domains
 * - Guarantees proper single leading slash (prevents missing or double slashes)
 * - Retains external links (e.g. Google Forms, GitHub) if intended
 */
export function formatActionUrl(actionUrl?: string, customBaseUrl?: string): string {
  const baseUrl = (customBaseUrl || getCanonicalSiteUrl()).replace(/\/+$/, '');
  if (!actionUrl || !actionUrl.trim()) {
    return `${baseUrl}/`;
  }

  const clean = actionUrl.trim();

  // If a full URL is provided, check if it points to a local or former test domain
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      const isInternalHost =
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname.includes('vercel.app') ||
        parsed.hostname.includes('coe.edu') ||
        parsed.hostname === 'coe.xarc.online';

      if (isInternalHost) {
        const pathPart = `${parsed.pathname}${parsed.search}${parsed.hash}`;
        const normalizedPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
        return `${baseUrl}${normalizedPath}`;
      }
      return clean;
    } catch {
      // Fall through to relative formatting if URL parsing throws
    }
  }

  const normalized = clean.startsWith('/') ? clean : `/${clean}`;
  return `${baseUrl}${normalized}`;
}

let cachedTransporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function getSmtpConfigSummary() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || process.env.SMTP_SECURE === 'true');
  const user = process.env.SMTP_USER || '';
  const configured = Boolean(user && process.env.SMTP_PASS);
  const maskedUser = user ? `${user.slice(0, 3)}***@${user.split('@')[1] || 'domain'}` : 'Not configured';

  return {
    host,
    port,
    secure,
    user: maskedUser,
    authUser: maskedUser,
    from: process.env.EMAIL_FROM || user || 'Not configured',
    configured,
  };
}

function getTransporter(): Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || process.env.SMTP_SECURE === 'true');

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

function interpolate(text: string, vars: Record<string, string>): string {
  if (!text) return '';
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : `{{${key}}}`;
  });
}

export interface SendStatusEmailOptions {
  student: StudentRequest;
  newStatus: StudentStatus;
  customNote?: string;
  coeName?: string;
  institutionName?: string;
  contactEmail?: string;
  siteUrl?: string;
  sentBy?: string;
}

export async function sendStatusNotificationEmail(
  options: SendStatusEmailOptions
): Promise<{ sent: boolean; reason?: string; messageId?: string }> {
  const {
    student,
    newStatus,
    customNote,
    coeName = 'AR/VR Centre of Excellence',
    institutionName = 'Centre of Excellence',
    contactEmail = process.env.SMTP_USER || 'arvr.coe@institute.edu',
    siteUrl = getCanonicalSiteUrl(),
    sentBy = 'admin',
  } = options;

  const statusKey = String(newStatus).toUpperCase();

  const recipientEmail = (student.email || student.college_email || '').trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    await logEmailTransmission({
      recipient: recipientEmail || 'unknown',
      student_name: student.full_name,
      trigger_type: statusKey,
      subject: `Status Update: ${newStatus}`,
      status: 'FAILED',
      error: 'No valid recipient email address on student record.',
      sent_by: sentBy,
    });
    return { sent: false, reason: 'No valid recipient email on student record.' };
  }

  // Fetch dynamic custom templates from DB
  const templates: EmailTemplatesSettings = await getEmailTemplates();
  const lowerKey = statusKey.toLowerCase();
  const configuredTemplate =
    templates.status_templates?.[statusKey] ||
    (templates as any)[lowerKey] ||
    (DEFAULT_EMAIL_TEMPLATES.status_templates as any)?.[statusKey] ||
    (DEFAULT_EMAIL_TEMPLATES as any)[lowerKey];

  // If this status has automated emails explicitly disabled, skip
  if (configuredTemplate && configuredTemplate.enabled === false) {
    return { sent: false, reason: `Automated email transmission is disabled for status ${newStatus}.` };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`[SMTP Notification] SMTP not configured. Notification email to ${recipientEmail} skipped.`);
    await logEmailTransmission({
      recipient: recipientEmail,
      student_name: student.full_name,
      trigger_type: statusKey,
      subject: `Status Update: ${newStatus}`,
      status: 'FAILED',
      error: 'SMTP credentials not configured in environment variables (SMTP_USER/SMTP_PASS).',
      sent_by: sentBy,
    });
    return { sent: false, reason: 'SMTP credentials not configured in environment variables.' };
  }

  const fromAddress = process.env.EMAIL_FROM || `"${coeName}" <${process.env.SMTP_USER}>`;

  const templateVars: Record<string, string> = {
    student_name: student.full_name,
    register_number: student.register_number,
    department: student.department,
    year: student.year,
    interests: (student.interests || []).join(', ') || 'Spatial Computing',
    coe_name: coeName,
    institution_name: institutionName,
    site_url: siteUrl,
    status: newStatus,
  };

  // Lookup status details and theme color
  const settings = await getPublicSettings();
  const allStatuses = [...(settings.custom_statuses || []), ...DEFAULT_REQUEST_STATUSES];
  const matchedStatus = allStatuses.find((s) => s.key === statusKey);
  const statusLabel = matchedStatus?.label || statusKey;
  const badgeColor = matchedStatus?.color || '#06b6d4';
  const badgeBg = `${badgeColor}25`;

  const cfg = configuredTemplate || {
    subject: `Application Status Update: ${statusLabel}`,
    badge_text: `STATUS // ${statusLabel.toUpperCase()}`,
    headline: `Your Application Status: ${statusLabel}`,
    body_text: `Your student application to the {{coe_name}} has been updated to <strong>${statusLabel}</strong>.`,
    action_label: 'View Lab Portal →',
    action_url: '/',
    enabled: true,
  };

  const subject = interpolate(cfg.subject || `Application Status: ${statusLabel}`, templateVars);
  const badgeText = interpolate(cfg.badge_text || `STATUS // ${statusLabel.toUpperCase()}`, templateVars);
  const headline = interpolate(cfg.headline || `Application Status: ${statusLabel}`, templateVars);

  const nextStepsHtml = (cfg.next_steps && cfg.next_steps.length > 0)
    ? `
      <div style="background: ${badgeBg}; border-left: 4px solid ${badgeColor}; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: ${badgeColor}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Next Steps & Instructions:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.6; color: #e2e8f0;">
          ${cfg.next_steps.map((step: string) => `<li>${interpolate(step, templateVars)}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const rawBody = cfg.body_text
    ? interpolate(cfg.body_text, templateVars).replace(/\n/g, '<br/>')
    : `Your application to the <strong>${coeName}</strong> has been updated to <strong>${statusLabel}</strong>.`;

  const messageBody = `
    <p>Dear <strong>${student.full_name}</strong>,</p>
    <p>${rawBody}</p>
    ${nextStepsHtml}
  `;

  const resolvedActionUrl = formatActionUrl(cfg.action_url, siteUrl);
  const actionCallout = `
    <a href="${resolvedActionUrl}" style="display: inline-block; background: ${badgeColor}; color: #000; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px;">
      ${interpolate(cfg.action_label || 'View Lab Portal →', templateVars)}
    </a>
  `;

  const customNoteBlock = customNote
    ? `
      <div style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Message from the Faculty Coordinator:</p>
        <p style="margin: 0; font-size: 13.5px; color: #f8fafc; line-height: 1.55; white-space: pre-wrap;">${customNote}</p>
      </div>
    `
    : '';

  const htmlContent = buildCyberEmailHtml({
    subject,
    coeName,
    institutionName,
    contactEmail,
    badgeText,
    badgeBg,
    badgeColor,
    headline,
    studentInfo: {
      full_name: student.full_name,
      register_number: student.register_number,
      department: student.department,
      year: student.year,
    },
    messageBody,
    customNoteBlock,
    actionCallout,
  });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP Notification] Successfully sent ${newStatus} email to ${recipientEmail}. Message ID: ${info.messageId}`);

    await logEmailTransmission({
      recipient: recipientEmail,
      student_name: student.full_name,
      trigger_type: statusKey,
      subject,
      status: 'SENT',
      message_id: info.messageId,
      sent_by: sentBy,
    });

    return { sent: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP Notification Error] Failed to send email to ${recipientEmail}:`, error?.message || error);

    await logEmailTransmission({
      recipient: recipientEmail,
      student_name: student.full_name,
      trigger_type: statusKey,
      subject,
      status: 'FAILED',
      error: error?.message || 'SMTP transmission failure',
      sent_by: sentBy,
    });

    return { sent: false, reason: error?.message || 'SMTP transmission failure.' };
  }
}

// ---------------- DIAGNOSTIC TEST EMAIL TRANSMISSION ----------------

export async function sendDiagnosticTestEmail(
  toEmail: string,
  sentBy: string = 'admin'
): Promise<{ success: boolean; messageId?: string; latencyMs?: number; error?: string }> {
  const target = toEmail.trim();
  if (!target || !target.includes('@')) {
    return { success: false, error: 'Invalid recipient email address.' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env or Vercel variables.',
    };
  }

  const startTime = Date.now();
  const coeName = 'AR/VR Centre of Excellence';
  const fromAddress = process.env.EMAIL_FROM || `"${coeName}" <${process.env.SMTP_USER}>`;
  const subject = `⚡ SMTP Operational Diagnostic: Connection Verified`;

  // First verify transport connection
  try {
    await transporter.verify();
  } catch (verifyErr: any) {
    await logEmailTransmission({
      recipient: target,
      trigger_type: 'TEST',
      subject,
      status: 'FAILED',
      error: `Handshake failed: ${verifyErr?.message || verifyErr}`,
      sent_by: sentBy,
    });
    return {
      success: false,
      error: `SMTP server handshake failed: ${verifyErr?.message || verifyErr}`,
    };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid rgba(14, 165, 233, 0.4); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, #06b6d4, #10b981, #8b5cf6);"></td></tr>
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 11px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.15em;">CENTRE OF EXCELLENCE // DIAGNOSTICS</div>
              <div style="font-size: 20px; font-weight: 800; color: #ffffff;">SMTP Transceiver Verified</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 9999px; color: #10b981; font-size: 11px; font-weight: 700; margin-bottom: 18px;">
                STATUS // 200 OK — READY FOR PRODUCTION
              </div>
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Your Outbound Mail Pipeline is Fully Operational.
              </h2>
              <p style="font-size: 14.5px; line-height: 1.6; color: #cbd5e1;">
                This test transmission confirms that your SMTP gateway credentials, secure TLS/SSL handshake, and template compiler are performing as expected.
              </p>
              <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 12.5px; color: #94a3b8;">
                <div style="margin-bottom: 6px;"><strong>Host:</strong> ${process.env.SMTP_HOST || 'smtp.gmail.com'}</div>
                <div style="margin-bottom: 6px;"><strong>Port:</strong> ${process.env.SMTP_PORT || '465'}</div>
                <div style="margin-bottom: 6px;"><strong>User:</strong> ${process.env.SMTP_USER}</div>
                <div style="margin-bottom: 6px;"><strong>Sender:</strong> ${fromAddress}</div>
                <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
              </div>
              <p style="font-size: 13.5px; color: #64748b;">
                You can now safely induct candidates and dispatch broadcast communications with automatic delivery tracking.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #64748b; text-align: center;">
              Transmitted from AR/VR Centre of Excellence Administrative Console.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: target,
      subject,
      html: htmlContent,
    });

    const latencyMs = Date.now() - startTime;
    await logEmailTransmission({
      recipient: target,
      trigger_type: 'TEST',
      subject,
      status: 'SENT',
      message_id: info.messageId,
      sent_by: sentBy,
    });

    return {
      success: true,
      messageId: info.messageId,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    await logEmailTransmission({
      recipient: target,
      trigger_type: 'TEST',
      subject,
      status: 'FAILED',
      error: err?.message || 'Transmission failure',
      sent_by: sentBy,
    });

    return {
      success: false,
      error: err?.message || 'SMTP transmission failure',
      latencyMs,
    };
  }
}

// ---------------- COHORT BROADCAST ANNOUNCEMENT TRANSMISSION ----------------

export interface BroadcastAnnouncementOptions {
  recipients: Array<{ email: string; name: string }>;
  subject: string;
  badge?: string;
  headline: string;
  message: string;
  customNote?: string;
  actionLabel?: string;
  actionUrl?: string;
  sentBy?: string;
}

export async function sendCohortAnnouncementEmail(
  options: BroadcastAnnouncementOptions
): Promise<{ sentCount: number; failedCount: number; totalCount: number }> {
  const {
    recipients,
    subject,
    badge = 'COE // OFFICIAL ANNOUNCEMENT',
    headline,
    message,
    customNote,
    actionLabel,
    actionUrl,
    sentBy = 'admin',
  } = options;

  const transporter = getTransporter();
  const coeName = 'AR/VR Centre of Excellence';
  const institutionName = 'Centre of Excellence';
  const siteUrl = getCanonicalSiteUrl();
  const fromAddress = process.env.EMAIL_FROM || `"${coeName}" <${process.env.SMTP_USER}>`;

  if (!transporter) {
    for (const r of recipients) {
      await logEmailTransmission({
        recipient: r.email,
        student_name: r.name,
        trigger_type: 'ANNOUNCEMENT',
        subject,
        status: 'FAILED',
        error: 'SMTP credentials not configured.',
        sent_by: sentBy,
      });
    }
    return { sentCount: 0, failedCount: recipients.length, totalCount: recipients.length };
  }

  let sentCount = 0;
  let failedCount = 0;

  const results = await Promise.allSettled(
    recipients.map(async (r) => {
      const customNoteBlock = customNote
        ? `
          <div style="background: rgba(30, 41, 59, 0.9); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Coordinator Note:</p>
            <p style="margin: 0; font-size: 13.5px; color: #f8fafc; line-height: 1.55; white-space: pre-wrap;">${customNote}</p>
          </div>
        `
        : '';

      const resolvedAnnouncementUrl = actionUrl ? formatActionUrl(actionUrl, siteUrl) : '';
      const actionCallout = actionLabel && resolvedAnnouncementUrl
        ? `
          <a href="${resolvedAnnouncementUrl}" style="display: inline-block; background: #06b6d4; color: #000; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px;">
            ${actionLabel}
          </a>
        `
        : '';

      const html = buildCyberEmailHtml({
        subject,
        coeName,
        institutionName,
        contactEmail: process.env.SMTP_USER || 'arvr.coe@institute.edu',
        badgeText: badge,
        badgeBg: 'rgba(6, 182, 212, 0.15)',
        badgeColor: '#06b6d4',
        headline,
        studentInfo: { full_name: r.name },
        messageBody: `
          <p>Dear <strong>${r.name}</strong>,</p>
          <div style="font-size: 14.5px; line-height: 1.65; color: #cbd5e1; white-space: pre-wrap;">
            ${message}
          </div>
        `,
        customNoteBlock,
        actionCallout,
      });

      try {
        const info = await transporter.sendMail({
          from: fromAddress,
          to: r.email,
          subject,
          html,
        });

        await logEmailTransmission({
          recipient: r.email,
          student_name: r.name,
          trigger_type: 'ANNOUNCEMENT',
          subject,
          status: 'SENT',
          message_id: info.messageId,
          sent_by: sentBy,
        });

        return { success: true };
      } catch (err: any) {
        await logEmailTransmission({
          recipient: r.email,
          student_name: r.name,
          trigger_type: 'ANNOUNCEMENT',
          subject,
          status: 'FAILED',
          error: err?.message || 'Delivery error',
          sent_by: sentBy,
        });
        throw err;
      }
    })
  );

  results.forEach((res) => {
    if (res.status === 'fulfilled') sentCount++;
    else failedCount++;
  });

  return { sentCount, failedCount, totalCount: recipients.length };
}

// ---------------- SHARED HTML BUILDER ----------------

function buildCyberEmailHtml(params: {
  subject: string;
  coeName: string;
  institutionName: string;
  contactEmail: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  headline: string;
  studentInfo?: { full_name: string; register_number?: string; department?: string; year?: string };
  messageBody: string;
  customNoteBlock?: string;
  actionCallout?: string;
}): string {
  const {
    subject,
    coeName,
    institutionName,
    contactEmail,
    badgeText,
    badgeBg,
    badgeColor,
    headline,
    studentInfo,
    messageBody,
    customNoteBlock = '',
    actionCallout = '',
  } = params;

  const studentPill = studentInfo?.register_number
    ? `
      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 12.5px; color: #94a3b8;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-bottom: 4px;"><strong>Applicant:</strong> ${studentInfo.full_name}</td>
            <td align="right" style="padding-bottom: 4px;"><strong>Register No:</strong> ${studentInfo.register_number}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong> ${studentInfo.department}</td>
            <td align="right"><strong>Year:</strong> ${studentInfo.year}</td>
          </tr>
        </table>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);"></td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="font-size: 11px; font-weight: 700; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 6px;">
                ${institutionName.toUpperCase()}
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                ${coeName}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="display: inline-block; padding: 6px 14px; background: ${badgeBg}; border: 1px solid ${badgeColor}; border-radius: 9999px; color: ${badgeColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 18px;">
                ${badgeText}
              </div>
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.25;">
                ${headline}
              </h2>
              ${studentPill}
              <div style="font-size: 14.5px; line-height: 1.65; color: #cbd5e1;">
                ${messageBody}
              </div>
              ${customNoteBlock}
              ${actionCallout ? `<div style="margin-top: 32px; text-align: center;">${actionCallout}</div>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background: rgba(0, 0, 0, 0.25); border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: #64748b; text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 6px 0;">This is an official administrative transmission from <strong>${coeName}</strong>.</p>
              <p style="margin: 0 0 6px 0;">Official Portal: <a href="https://coe.xarc.online" style="color: #06b6d4; text-decoration: none;">coe.xarc.online</a> • Questions? Contact the CoE team at <a href="mailto:${contactEmail}" style="color: #06b6d4; text-decoration: none;">${contactEmail}</a></p>
              <p style="margin: 0;">© ${new Date().getFullYear()} ${coeName}. All Rights Reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
