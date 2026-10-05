import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { isMongoConfigured, getMongoDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = initDb();
    const isHealthy = Boolean(db && db.settings && Array.isArray(db.student_requests));
    const mongoConfigured = isMongoConfigured();
    let mongoConnected = false;

    if (mongoConfigured) {
      try {
        const mdb = await getMongoDb();
        if (mdb) {
          await mdb.command({ ping: 1 });
          mongoConnected = true;
        }
      } catch {
        mongoConnected = false;
      }
    }

    return NextResponse.json(
      {
        status: isHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          primary: mongoConfigured ? 'mongodb_atlas' : 'embedded_atomic_json',
          mongo_configured: mongoConfigured,
          mongo_connected: mongoConnected,
          fallback_ready: true,
        },
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
