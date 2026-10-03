'use client';

import React, { useState, useEffect } from 'react';

interface FooterProps {
  institutionName?: string;
  coeName?: string;
  contactEmail?: string;
  campusAddress?: string;
}

export default function Footer(props: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState({
    institutionName: props.institutionName || 'Centre of Excellence',
    coeName: props.coeName || 'AR/VR Centre of Excellence',
    contactEmail: props.contactEmail || 'arvr.coe@institute.edu',
    campusAddress: props.campusAddress || 'Technology Campus, Innovation Corridor',
  });

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((res) => {
        if (res?.settings) {
          setData({
            institutionName: res.settings.institution_name || 'Centre of Excellence',
            coeName: res.settings.coe_name || 'AR/VR Centre of Excellence',
            contactEmail: res.settings.contact_email || 'arvr.coe@institute.edu',
            campusAddress: res.settings.campus_address || 'Technology Campus, Innovation Corridor',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer
      className="footer-wrapper"
      style={{
        padding: '24px 0',
        borderTop: '1px solid var(--border-subtle)',
        background: 'transparent',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          © {currentYear} {data.coeName}, {data.institutionName}. All Rights Reserved.
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="beacon-dot" />
          <span>SPATIAL COMPUTING LAB • NODE ONLINE</span>
        </div>
      </div>
    </footer>
  );
}
