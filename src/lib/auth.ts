import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { initDb } from './db';
import { AdminUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'arvr-coe-pec-super-secret-jwt-key-2026';
const COOKIE_NAME = 'arvr_admin_session';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

// In-memory rate limiting map for login attempts
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(ipOrKey: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(ipOrKey);

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // If block expired, reset attempts
  if (record.blockedUntil !== 0 && record.blockedUntil <= now) {
    loginRateLimitMap.delete(ipOrKey);
  }

  return { allowed: true };
}

export function recordFailedLogin(ipOrKey: string): void {
  const now = Date.now();
  const record = loginRateLimitMap.get(ipOrKey) || { attempts: 0, blockedUntil: 0 };
  record.attempts += 1;

  // Block for 5 minutes after 5 consecutive failed attempts
  if (record.attempts >= 5) {
    record.blockedUntil = now + 5 * 60 * 1000;
  }

  loginRateLimitMap.set(ipOrKey, record);
}

export function resetLoginRateLimit(ipOrKey: string): void {
  loginRateLimitMap.delete(ipOrKey);
}

// In-memory rate limiting map for public application submissions
const submissionRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkSubmissionRateLimit(ipOrKey: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15-minute window
  const maxSubmissions = 15; // Up to 15 per IP per window

  const record = submissionRateLimitMap.get(ipOrKey);
  if (!record || record.resetAt <= now) {
    submissionRateLimitMap.set(ipOrKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxSubmissions) {
    const remainingSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

export function signAdminToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  const db = initDb();
  const admin = db.admin_users.find((u) => u.id === payload.userId);
  return admin || null;
}

export function getSessionAdminFromRequest(req: NextRequest): AdminUser | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  const db = initDb();
  const admin = db.admin_users.find((u) => u.id === payload.userId);
  return admin || null;
}

export { COOKIE_NAME };
