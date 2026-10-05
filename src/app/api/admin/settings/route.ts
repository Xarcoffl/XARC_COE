import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSessionAdminFromRequest, signAdminToken, COOKIE_NAME } from '@/lib/auth';
import { initDb, saveDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const db = initDb();
  return NextResponse.json({
    success: true,
    settings: db.settings,
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
    const db = initDb();

    // 1. Update site settings if provided
    if (settings) {
      db.settings = {
        ...db.settings,
        ...settings,
      };
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

    saveDb(db);

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
