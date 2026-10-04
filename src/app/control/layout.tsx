'use client';

import React, { useEffect } from 'react';

/**
 * ControlLayout
 * Enforces strictly Dark Mode across all Administrative and Control routes (/control/*).
 * Even if a user selected Light Mode on public pages, navigating to the Admin system
 * immediately locks into Dark Mode. When exiting back to public pages, the user's
 * preferred theme is gracefully restored.
 */
export default function ControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Force document root into Dark Mode for Admin Panel
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');

    return () => {
      // When unmounting (navigating away from /control to public), restore user theme
      try {
        const storedTheme = localStorage.getItem('arvr_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', storedTheme);
        if (storedTheme === 'light') {
          document.documentElement.classList.add('light-theme');
          document.documentElement.classList.remove('dark-theme');
        } else {
          document.documentElement.classList.add('dark-theme');
          document.documentElement.classList.remove('light-theme');
        }
      } catch (e) {
        // Fallback safely in case localStorage is blocked
      }
    };
  }, []);

  return (
    <div
      id="admin-root-container"
      data-theme="dark"
      className="dark-theme"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0f19',
        color: '#e2e8f0',
        colorScheme: 'dark',
      }}
    >
      {children}
    </div>
  );
}
