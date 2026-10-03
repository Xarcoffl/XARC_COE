'use client';

import React, { useState } from 'react';
import EventStage3D from './EventStage3D';
import { Image as ImageIcon, Box } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface EventMediaInspectorProps {
  poster: string;
  title: string;
  category: string;
  status?: string;
  startDate?: string;
}

export default function EventMediaInspector({
  poster,
  title,
  category,
  status = 'upcoming',
  startDate,
}: EventMediaInspectorProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const switchMode = (mode: '3d' | '2d') => {
    setViewMode(mode);
    soundFx.playModeSwitch();
  };

  return (
    <div style={{ marginBottom: '48px' }}>
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
            <span>3D SPATIAL ARENA</span>
          </button>

          <button
            onClick={() => switchMode('2d')}
            className={`tab-btn ${viewMode === '2d' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <ImageIcon size={16} />
            <span>2D EVENT POSTER</span>
          </button>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
          {viewMode === '3d' ? '// HOLOGRAPHIC_ARENA_ACTIVE' : '// OFFICIAL_EVENT_POSTER'}
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === '3d' ? (
        <EventStage3D category={category} title={title} status={status} startDate={startDate} />
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
            src={poster}
            alt={title}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}
