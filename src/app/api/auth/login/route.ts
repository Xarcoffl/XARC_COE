import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDb } from '@/lib/db';
import { signAdminToken, checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const rawIp = req.headers.get('x-forwarded-for') || 'local-ip';
    const ip = rawIp.split(',')[0].trim();
    const rateCheck = checkLoginRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password.' },
        { status: 400 }
      );
    }

    const db = initDb();
    const admin = db.admin_users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!admin) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { success: false, message: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { success: false, message: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    resetLoginRateLimit(ip);

    const token = signAdminToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred during authentication.' },
      { status: 500 }
    );
  }
}
