import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSessionAdminFromRequest } from '@/lib/auth';
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

    // 2. Update profile name if provided
    const adminIdx = db.admin_users.findIndex((u) => u.id === admin.id);
    if (adminIdx !== -1 && profile?.name) {
      db.admin_users[adminIdx].name = profile.name;
    }

    // 3. Update password if requested
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
      db.admin_users[adminIdx].updated_at = new Date().toISOString();
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Settings and profile updated successfully.',
      settings: db.settings,
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, message: 'Failed to update settings.' }, { status: 500 });
  }
}
