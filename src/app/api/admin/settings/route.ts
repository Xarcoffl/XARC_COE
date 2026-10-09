import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSessionAdminFromRequest, signAdminToken, COOKIE_NAME } from '@/lib/auth';
import {
  initDb,
  saveDbAsync,
  hydrateFromMongoIfNeeded,
  DEFAULT_DEPARTMENTS,
  DEFAULT_INTEREST_OPTIONS,
  DEFAULT_REQUEST_CONTENT,
} from '@/lib/db';
import { isMongoConfigured } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }

  const db = initDb();
  const configuredDepts = db.settings?.departments || db.request_content?.departments || DEFAULT_DEPARTMENTS;
  const configuredInterests = db.settings?.interest_options || db.request_content?.interest_options || DEFAULT_INTEREST_OPTIONS;
  const hydratedSettings = {
    ...db.settings,
    departments: configuredDepts,
    interest_options: configuredInterests,
  };

  return NextResponse.json({
    success: true,
    settings: hydratedSettings,
    admin_profile: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { settings, profile, new_password, current_password } = await req.json();
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    // 1. Update site settings if provided
    if (settings) {
      db.settings = {
        ...db.settings,
        ...settings,
      };
      if (settings.departments && Array.isArray(settings.departments)) {
        if (!db.request_content) db.request_content = { ...DEFAULT_REQUEST_CONTENT };
        db.request_content.departments = settings.departments;
      }
      if (settings.interest_options && Array.isArray(settings.interest_options)) {
        if (!db.request_content) db.request_content = { ...DEFAULT_REQUEST_CONTENT };
        db.request_content.interest_options = settings.interest_options;
      }
    }

    const adminIdx = db.admin_users.findIndex((u) => u.id === admin.id);
    if (adminIdx === -1) {
      return NextResponse.json({ success: false, message: 'Admin user not found.' }, { status: 404 });
    }

    let profileChanged = false;

    // 2. Update profile name if provided
    if (profile?.name && profile.name.trim() !== db.admin_users[adminIdx].name) {
      db.admin_users[adminIdx].name = profile.name.trim();
      profileChanged = true;
    }

    // 3. Update profile email if provided
    if (profile?.email && profile.email.trim().toLowerCase() !== db.admin_users[adminIdx].email.toLowerCase()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = profile.email.trim().toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json({ success: false, message: 'Please provide a valid email address.' }, { status: 400 });
      }

      const duplicate = db.admin_users.find(
        (u) => u.id !== admin.id && u.email.toLowerCase() === cleanEmail
      );
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: 'This email is already registered to another administrator.' },
          { status: 400 }
        );
      }

      db.admin_users[adminIdx].email = cleanEmail;
      profileChanged = true;
    }

    // 4. Update password if requested
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ success: false, message: 'Current password is required to set a new password.' }, { status: 400 });
      }

      const isCurrentMatch = bcrypt.compareSync(current_password, db.admin_users[adminIdx].password_hash);
      if (!isCurrentMatch) {
        return NextResponse.json({ success: false, message: 'Current password does not match.' }, { status: 400 });
      }

      if (new_password.length < 8) {
        return NextResponse.json({ success: false, message: 'New password must be at least 8 characters long.' }, { status: 400 });
      }

      const salt = bcrypt.genSaltSync(10);
      db.admin_users[adminIdx].password_hash = bcrypt.hashSync(new_password, salt);
      profileChanged = true;
    }

    if (profileChanged) {
      db.admin_users[adminIdx].updated_at = new Date().toISOString();
    }

    await saveDbAsync(db);

    const updatedAdmin = db.admin_users[adminIdx];

    const response = NextResponse.json({
      success: true,
      message: 'Settings and administrator profile updated successfully.',
      settings: db.settings,
      admin_profile: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
      },
    });

    // Re-issue session cookie if profile identity changed so the admin stays authenticated
    if (profileChanged) {
      const updatedToken = signAdminToken({
        userId: updatedAdmin.id,
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: updatedAdmin.role,
      });

      response.cookies.set(COOKIE_NAME, updatedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, message: 'Failed to update settings.' }, { status: 500 });
  }
}
