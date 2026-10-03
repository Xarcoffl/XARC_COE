'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { themeManager, Theme } from '@/lib/theme';
import { soundFx } from '@/lib/soundFx';

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(themeManager.getTheme());
    const unsub = themeManager.subscribe((t) => {
      setTheme(t);
    });
    return unsub;
  }, []);

  const handleToggle = () => {
    soundFx.playModeSwitch();
    themeManager.toggle();
  };

  if (!mounted) {
    return (
      <div
        style={{
          width: compact ? '36px' : '100%',
          height: '38px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
    );
  }

  const isLight = theme === 'light';

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className="theme-toggle-btn"
        title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        aria-label="Toggle Theme Mode"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
          border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.15)',
          color: isLight ? '#0284c7' : '#00f5ff',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 0 12px rgba(0, 245, 255, 0.2)',
        }}
      >
        {isLight ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="theme-toggle-btn"
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle Theme Mode"
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
        border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.12)',
        color: isLight ? '#0f172a' : '#f8fafc',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(0, 245, 255, 0.15)',
            color: isLight ? '#0284c7' : '#00f5ff',
          }}
        >
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
          {isLight ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(0, 245, 255, 0.15)',
          color: isLight ? '#0284c7' : '#00f5ff',
          letterSpacing: '0.08em',
        }}
      >
        {isLight ? 'LIGHT' : 'DARK'}
      </span>
    </button>
  );
}
