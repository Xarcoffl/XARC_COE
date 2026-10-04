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
      suppressHydrationWarning
      onClick={handleToggle}
      className="sound-toggle-btn"
      aria-label={enabled ? 'Mute Spatial Audio' : 'Enable Spatial Audio'}
      title={enabled ? 'Spatial Audio: Enabled (Click to Mute)' : 'Spatial Audio: Muted (Click to Enable)'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '10px',
        background: enabled ? 'rgba(0, 245, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
        border: enabled ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
        color: enabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        padding: 0,
        boxShadow: enabled ? '0 0 12px var(--accent-cyan-glow)' : 'none',
      }}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
