'use client';

import React, { useState } from 'react';
import ProjectHologram3D from './ProjectHologram3D';
import { Eye, Image as ImageIcon, Box } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface ProjectMediaInspectorProps {
  coverImage: string;
  title: string;
  category: 'AR' | 'VR' | 'MR' | 'XR' | '3D' | 'SIMULATION';
}

export default function ProjectMediaInspector({ coverImage, title, category }: ProjectMediaInspectorProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const switchMode = (mode: '3d' | '2d') => {
    setViewMode(mode);
    soundFx.playModeSwitch();
  };

  return (
    <div style={{ marginBottom: '56px' }}>
      {/* View Mode Switcher Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => switchMode('3d')}
            className={`tab-btn ${viewMode === '3d' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Box size={16} />
            <span>3D SPATIAL PROTOTYPE</span>
          </button>

          <button
            onClick={() => switchMode('2d')}
            className={`tab-btn ${viewMode === '2d' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <ImageIcon size={16} />
            <span>2D PHOTO CAPTURE</span>
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          {viewMode === '3d' ? '// INTERACTIVE_WEBGL_ACTIVE' : '// HIGH_RESOLUTION_RENDER'}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === '3d' ? (
        <ProjectHologram3D category={category} title={title} />
      ) : (
        <div
          style={{
            width: '100%',
            maxHeight: '520px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid rgba(76, 125, 255, 0.25)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <img
            src={coverImage}
            alt={title}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}
