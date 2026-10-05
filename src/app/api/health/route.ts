import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    const db = initDb();
    const isHealthy = Boolean(db && db.settings && Array.isArray(db.student_requests));

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: err?.message || 'Database health check failed' },
      { status: 500 }
    );
  }
}
