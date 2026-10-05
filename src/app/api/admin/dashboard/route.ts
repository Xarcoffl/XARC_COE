import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getAdminDashboardStats } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const stats = await getAdminDashboardStats();
  return NextResponse.json({ success: true, stats });
}
