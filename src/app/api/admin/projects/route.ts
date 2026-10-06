import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdminFromRequest } from '@/lib/auth';
import { initDb, saveDbAsync, hydrateFromMongoIfNeeded } from '@/lib/db';
import { isMongoConfigured } from '@/lib/mongodb';
import { Project } from '@/lib/types';

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
  return NextResponse.json({ success: true, projects: db.projects });
}

export async function POST(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      slug,
      title: body.title,
      category: body.category || 'VR',
      cover_image: body.cover_image || 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
      short_desc: body.short_desc || '',
      full_desc: body.full_desc || '',
      problem: body.problem || '',
      solution: body.solution || '',
      technologies: Array.isArray(body.technologies) ? body.technologies : (body.technologies || '').split(',').map((t: string) => t.trim()),
      team: Array.isArray(body.team) ? body.team : (body.team || '').split(',').map((t: string) => t.trim()),
      mentor: body.mentor || 'Faculty Lead',
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      video_url: body.video_url || '',
      result_outcome: body.result_outcome || '',
      is_featured: Boolean(body.is_featured),
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.projects.unshift(newProject);
    await saveDbAsync(db);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err) {
    console.error('Error creating project:', err);
    return NextResponse.json({ success: false, message: 'Failed to create project.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (isMongoConfigured()) {
      await hydrateFromMongoIfNeeded();
    }
    const db = initDb();

    const idx = db.projects.findIndex((p) => p.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    db.projects[idx] = {
      ...db.projects[idx],
      ...body,
      technologies: Array.isArray(body.technologies) ? body.technologies : (body.technologies || '').split(',').map((t: string) => t.trim()),
      team: Array.isArray(body.team) ? body.team : (body.team || '').split(',').map((t: string) => t.trim()),
      updated_at: new Date().toISOString(),
    };

    await saveDbAsync(db);
    return NextResponse.json({ success: true, project: db.projects[idx] });
  } catch (err) {
    console.error('Error updating project:', err);
    return NextResponse.json({ success: false, message: 'Failed to update project.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getSessionAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Project ID required' }, { status: 400 });
  }

  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  db.projects = db.projects.filter((p) => p.id !== id);
  await saveDbAsync(db);

  return NextResponse.json({ success: true, message: 'Project removed.' });
}
