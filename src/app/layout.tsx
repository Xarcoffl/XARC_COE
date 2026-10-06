import type { Metadata } from 'next';
import './globals.css';
import '../styles/admin.css';
import { getPublicSettings } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const title = settings.site_title || `${settings.coe_name} | ${settings.institution_name}`;
  const description =
    settings.meta_description ||
    settings.tagline ||
    'A multidisciplinary immersive technology ecosystem for students to learn, collaborate, develop practical skills and build solutions using AR, VR, MR, XR, 3D and related technologies.';
  const favicon = settings.favicon_url || '/favicon.ico';

  return {
    title: {
      default: title,
      template: `%s | ${settings.coe_name}`,
    },
    description,
    keywords: [
      settings.coe_name,
      settings.institution_name,
      'Spatial Computing',
      'Extended Reality',
      'Virtual Reality Lab',
      'Augmented Reality',
      'Mixed Reality',
      'Unity 3D',
      'Unreal Engine',
      'WebGL 3D',
    ],
    authors: [{ name: `${settings.institution_name} ${settings.coe_name}` }],
    openGraph: {
      title,
      description,
      siteName: settings.coe_name,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="dark-theme" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('arvr_theme') || 'dark';
                document.documentElement.setAttribute('data-theme', t);
                if (t === 'light') {
                  document.documentElement.classList.add('light-theme');
                  document.documentElement.classList.remove('dark-theme');
                } else {
                  document.documentElement.classList.add('dark-theme');
                  document.documentElement.classList.remove('light-theme');
                }
              } catch(e) {}
            })()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
