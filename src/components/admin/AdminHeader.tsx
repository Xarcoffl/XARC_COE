'use client';

import React from 'react';
import { User, Shield } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header-title">{title}</h1>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{subtitle}</div>
        )}
      </div>

      <div className="admin-header-user">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Shield size={16} style={{ color: '#3b82f6' }} />
          <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Authenticated Committee Admin</span>
        </div>
      </div>
    </header>
  );
}
