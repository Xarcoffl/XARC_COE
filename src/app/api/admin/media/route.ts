import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { getMediaAssets, deleteMediaAsset } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;

  const assets = await getMediaAssets(category);
  return NextResponse.json({ success: true, assets });
}

export async function DELETE(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, message: 'Asset ID is required.' }, { status: 400 });
  }

  const deleted = await deleteMediaAsset(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: 'Asset not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Asset deleted successfully.' });
}
