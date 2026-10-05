'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone } from 'lucide-react';

interface FooterProps {
  institutionName?: string;
  coeName?: string;
  contactEmail?: string;
  contactPhone?: string;
  footerCopyright?: string;
  footerTagline?: string;
}

export default function Footer(props: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState({
    institutionName: props.institutionName || 'Centre of Excellence',
    coeName: props.coeName || 'AR/VR Centre of Excellence',
    contactEmail: props.contactEmail || 'arvr.coe@institute.edu',
    contactPhone: props.contactPhone || '+91 (0) 80 2345 6789',
    footerCopyright: props.footerCopyright || 'All Rights Reserved.',
    footerTagline: props.footerTagline || '',
  });

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((res) => {
        if (res?.settings) {
          setData((prev) => ({
            ...prev,
            institutionName: res.settings.institution_name || prev.institutionName,
            coeName: res.settings.coe_name || prev.coeName,
            contactEmail: res.settings.contact_email || prev.contactEmail,
            contactPhone: res.settings.contact_phone || prev.contactPhone,
            footerCopyright: res.settings.footer_copyright || prev.footerCopyright,
            footerTagline: res.settings.footer_tagline !== undefined ? res.settings.footer_tagline : prev.footerTagline,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const cleanPhone = data.contactPhone.replace(/[^0-9+]/g, '');

  return (
    <footer
      id="site-footer"
      className="footer-wrapper"
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--surface-ground)',
        padding: '24px 0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.86rem',
        }}
      >
        {/* Copyright & CoE Name & Optional Tagline */}
        <div suppressHydrationWarning style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>
            © {currentYear} <strong style={{ color: 'var(--text-primary)' }}>{data.coeName}</strong>, {data.institutionName}. {data.footerCopyright}
          </span>
          {data.footerTagline && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'var(--surface-card-alt)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {data.footerTagline}
            </span>
          )}
        </div>

        {/* Contact Number and Mail ID Only */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          {/* Mail ID */}
          <a
            href={`mailto:${data.contactEmail}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              fontFamily: 'var(--font-mono)',
              transition: 'opacity var(--transition-fast)',
            }}
          >
            <Mail size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>{data.contactEmail}</span>
          </a>

          <span style={{ color: 'var(--border-active)' }}>•</span>

          {/* Contact Number */}
          <a
            href={`tel:${cleanPhone}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              fontFamily: 'var(--font-mono)',
              transition: 'opacity var(--transition-fast)',
            }}
          >
            <Phone size={15} style={{ color: '#4ade80' }} />
            <span>{data.contactPhone}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
