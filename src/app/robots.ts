import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coe.xarc.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/control/', '/api/admin/', '/api/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
