'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Eye, Activity, Cpu, Sparkles } from 'lucide-react';
import { themeManager, Theme } from '@/lib/theme';

export default function HeroSpatialCockpit() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [roll, setRoll] = useState(0);
  const [fps, setFps] = useState(60);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    setTheme(themeManager.getTheme());
    const unsub = themeManager.subscribe((t) => setTheme(t));
    return unsub;
  }, []);

  useEffect(() => {
    // Mouse movement telemetry tracking
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      setYaw(Math.round(normX * 45));
      setPitch(Math.round(normY * 35));
      setRoll(Math.round(-normX * normY * 15));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // FPS loop
    let animId: number;
    const updateStats = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.min(120, Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current))));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animId = requestAnimationFrame(updateStats);
    };
    animId = requestAnimationFrame(updateStats);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const isLight = theme === 'light';

  return (
    <div
      className="glass-card hud-corner"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: isLight ? '1px solid rgba(0, 180, 216, 0.35)' : '1px solid rgba(0, 245, 255, 0.28)',
        background: isLight
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(241, 245, 249, 0.92) 100%)'
          : 'linear-gradient(135deg, rgba(13, 21, 39, 0.6) 0%, rgba(8, 12, 28, 0.75) 100%)',
        backdropFilter: 'blur(28px) saturate(200%)',
        WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        padding: '24px',
        boxShadow: isLight
          ? '0 20px 45px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 0 25px rgba(0, 180, 216, 0.12)'
          : '0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.2), 0 0 30px rgba(0, 245, 255, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '400px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Telemetry Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="beacon-dot" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.74rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              SPATIAL_COCKPIT // 6-DOF HUD
            </span>
          </div>
          <span
            className="badge"
            style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid #4ade80',
              color: '#4ade80',
              backdropFilter: 'blur(8px)',
            }}
          >
            LIVE SYNC
          </span>
        </div>

        {/* 6-DoF Orientation Gauges with Glass Tile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 245, 255, 0.04)',
            border: isLight ? '1px solid rgba(0, 180, 216, 0.22)' : '1px solid rgba(0, 245, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
            textAlign: 'center',
            boxShadow: isLight
              ? 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.04)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PITCH</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {pitch > 0 ? `+${pitch}°` : `${pitch}°`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>YAW</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
              {yaw > 0 ? `+${yaw}°` : `${yaw}°`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ROLL</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
              {roll > 0 ? `+${roll}°` : `${roll}°`}
            </div>
          </div>
        </div>
      </div>

      {/* Center Reticle Radar Graphic */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 0',
        }}
      >
        <div
          style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: isLight ? '1px dashed rgba(2, 132, 199, 0.6)' : '1px dashed rgba(0, 245, 255, 0.6)',
            background: isLight
              ? 'radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, rgba(123, 97, 255, 0.06) 50%, rgba(241, 245, 249, 0.7) 100%)'
              : 'radial-gradient(circle, rgba(0, 245, 255, 0.08) 0%, rgba(123, 97, 255, 0.04) 50%, rgba(5, 8, 20, 0.4) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: isLight
              ? '0 0 24px rgba(2, 132, 199, 0.18), inset 0 0 16px rgba(2, 132, 199, 0.08)'
              : '0 0 28px rgba(0, 245, 255, 0.25), inset 0 0 16px rgba(0, 245, 255, 0.1)',
            transform: `rotate(${yaw}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {/* Inner concentric ring */}
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: isLight ? 'rgba(123, 97, 255, 0.15)' : 'rgba(123, 97, 255, 0.1)',
              border: isLight ? '1.5px solid rgba(123, 97, 255, 0.7)' : '1.5px solid rgba(123, 97, 255, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: isLight ? '0 0 12px rgba(123, 97, 255, 0.2)' : '0 0 16px rgba(123, 97, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={28} style={{ color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 8px var(--accent-cyan-glow))' }} />
          </div>

          {/* High-visibility SVG Reticle with coordinate ticks & crosshairs */}
          <svg
            viewBox="0 0 130 130"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {/* Center crosshairs with vivid contrast */}
            <line x1="2" y1="65" x2="44" y2="65" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
            <line x1="86" y1="65" x2="128" y2="65" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
            <line x1="65" y1="2" x2="65" y2="44" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
            <line x1="65" y1="86" x2="65" y2="128" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />

            {/* 4 Cardinal reticle coordinate dots */}
            <circle cx="65" cy="6" r="2.5" fill="var(--accent-cyan)" />
            <circle cx="124" cy="65" r="2.5" fill="var(--accent-cyan)" />
            <circle cx="65" cy="124" r="2.5" fill="var(--accent-cyan)" />
            <circle cx="6" cy="65" r="2.5" fill="var(--accent-cyan)" />

            {/* Corner diagonal registration marks */}
            <line x1="22" y1="22" x2="28" y2="28" stroke="var(--accent-violet)" strokeWidth="1.5" opacity="0.9" />
            <line x1="108" y1="22" x2="102" y2="28" stroke="var(--accent-violet)" strokeWidth="1.5" opacity="0.9" />
            <line x1="22" y1="108" x2="28" y2="102" stroke="var(--accent-violet)" strokeWidth="1.5" opacity="0.9" />
            <line x1="108" y1="108" x2="102" y2="102" stroke="var(--accent-violet)" strokeWidth="1.5" opacity="0.9" />
          </svg>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em', fontWeight: 700 }}>
            OPTICAL TRACKING RIG
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Move cursor to steer spatial orientation
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Metrics Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          padding: '10px 16px',
          margin: '0 -24px -24px -24px',
          background: isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: isLight ? '1px solid rgba(0, 180, 216, 0.2)' : '1px solid rgba(0, 245, 255, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="#4ade80" />
          <span>FPS: <strong style={{ color: '#4ade80' }}>{fps}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="var(--accent-cyan)" />
          <span>LATENCY: &lt;7.2MS</span>
        </div>
        <div>
          <span>FOV: 110°</span>
        </div>
      </div>
    </div>
  );
}
