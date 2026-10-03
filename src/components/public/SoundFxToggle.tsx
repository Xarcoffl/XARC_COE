'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

export default function SoundFxToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(soundFx.getEnabled());
    const unsub = soundFx.subscribe((val) => setEnabled(val));
    return unsub;
  }, []);

  const handleToggle = () => {
    soundFx.toggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="sound-toggle-btn"
      aria-label={enabled ? 'Mute Spatial Audio' : 'Enable Spatial Audio'}
      title={enabled ? 'Spatial Audio: ON (Click to Mute)' : 'Spatial Audio: MUTED (Click to Enable)'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-full)',
        background: enabled ? 'rgba(0, 245, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
        border: enabled ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
        color: enabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      {enabled ? (
        <>
          <Volume2 size={14} className="text-cyan" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', height: '10px' }}>
            <span
              style={{
                width: '2px',
                height: '8px',
                background: 'var(--accent-cyan)',
                borderRadius: '1px',
                animation: 'pulse 1.2s infinite ease-in-out',
              }}
            />
            <span
              style={{
                width: '2px',
                height: '12px',
                background: 'var(--accent-cyan)',
                borderRadius: '1px',
                animation: 'pulse 0.9s infinite ease-in-out',
              }}
            />
            <span
              style={{
                width: '2px',
                height: '6px',
                background: 'var(--accent-cyan)',
                borderRadius: '1px',
                animation: 'pulse 1.5s infinite ease-in-out',
              }}
            />
          </span>
          <span className="hidden sm:inline" style={{ marginLeft: '2px' }}>SFX</span>
        </>
      ) : (
        <>
          <VolumeX size={14} />
          <span className="hidden sm:inline">MUTED</span>
        </>
      )}
    </button>
  );
}
