import { MetadataRoute } from 'next';
import { initDb } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const db = initDb();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arvr.coe.edu';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/verticals`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/projects`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/achievements`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/industry`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/request`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = db.projects
    .filter((p) => p.is_published)
    .map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at || now),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

  const eventRoutes: MetadataRoute.Sitemap = db.events
    .filter((e) => e.is_published)
    .map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: new Date(e.start_date || now),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

  return [...staticRoutes, ...projectRoutes, ...eventRoutes];
}
