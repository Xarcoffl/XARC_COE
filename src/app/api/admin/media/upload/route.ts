import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { saveMediaAsset } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    // A. Handling Multipart Form-Data (File Uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const category = (formData.get('category') as any) || 'general';
      const customName = formData.get('name') as string | null;

      if (!file) {
        return NextResponse.json({ success: false, message: 'No file provided in form data.' }, { status: 400 });
      }

      // Check max size: 5MB
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({
          success: false,
          message: 'File size exceeds maximum limit of 5 MB. Please optimize or compress image.',
        }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/png';
      const base64String = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64String}`;

      const asset = await saveMediaAsset({
        name: customName || file.name.replace(/\.[^/.]+$/, ''),
        original_name: file.name,
        mime_type: mimeType,
        size_bytes: file.size,
        data_url: dataUrl,
        category,
      });

      return NextResponse.json({
        success: true,
        message: 'Asset uploaded successfully.',
        asset,
      });
    }

    // B. Handling JSON Payload (Direct Base64 Data URL)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { data_url, name = 'Uploaded Image', original_name = 'upload.png', mime_type = 'image/png', category = 'general' } = body;

      if (!data_url) {
        return NextResponse.json({ success: false, message: 'data_url is required in JSON payload.' }, { status: 400 });
      }

      // Calculate approximate size
      const sizeBytes = Math.round((data_url.length * 3) / 4);
      if (sizeBytes > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          message: 'Image payload exceeds 5 MB limit.',
        }, { status: 400 });
      }

      const asset = await saveMediaAsset({
        name,
        original_name,
        mime_type,
        size_bytes: sizeBytes,
        data_url,
        category,
      });

      return NextResponse.json({
        success: true,
        message: 'Asset registered successfully.',
        asset,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Unsupported Content-Type. Please use multipart/form-data or application/json.',
    }, { status: 400 });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json({
      success: false,
      message: err?.message || 'Failed to upload media asset.',
    }, { status: 500 });
  }
}
