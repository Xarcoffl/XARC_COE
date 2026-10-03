'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Compass, Volume2, VolumeX, Eye, Activity, Cpu, Sparkles } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

export default function HeroSpatialCockpit() {
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [roll, setRoll] = useState(0);
  const [fps, setFps] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [waveHeights, setWaveHeights] = useState([12, 24, 18, 30, 16, 28, 22, 14]);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    // Check initial sound state and subscribe
    setSoundEnabled(soundFx.getEnabled());
    const unsubscribe = soundFx.subscribe((enabled) => {
      setSoundEnabled(enabled);
    });

    // Mouse movement telemetry tracking
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      setYaw(Math.round(normX * 45));
      setPitch(Math.round(normY * 35));
      setRoll(Math.round(-normX * normY * 15));
    };

    window.addEventListener('mousemove', handleMouseMove);

    // FPS loop & waveform animation
    let animId: number;
    const updateStats = () => {
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.min(120, Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current))));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Animate synthetic audio waveform
      setWaveHeights((prev) =>
        prev.map((h, i) => Math.max(6, Math.min(36, Math.round(18 + Math.sin(now * 0.005 + i * 1.2) * 14))))
      );

      animId = requestAnimationFrame(updateStats);
    };
    animId = requestAnimationFrame(updateStats);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      unsubscribe();
    };
  }, []);

  const toggleSound = () => {
    soundFx.toggle();
  };

  return (
    <div
      className="glass-card hud-corner"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-glass)',
        background: 'var(--surface-card)',
        backdropFilter: 'blur(16px)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '460px',
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
            }}
          >
            LIVE SYNC
          </span>
        </div>

        {/* 6-DoF Orientation Gauges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'var(--surface-card-alt)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
            textAlign: 'center',
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
            border: '1px dashed var(--accent-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 24px var(--accent-cyan-glow)',
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
              border: '1px solid var(--accent-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={28} style={{ color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 8px var(--accent-cyan-glow))' }} />
          </div>

          {/* Crosshairs */}
          <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--border-subtle)' }} />
          <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'var(--border-subtle)' }} />
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent-cyan)', letterSpacing: '0.08em' }}>
            OPTICAL TRACKING RIG
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Move cursor to steer spatial orientation
          </div>
        </div>
      </div>

      {/* Audio Waveform & Soundscape */}
      <div
        style={{
          background: 'var(--surface-card-alt)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleSound}
            style={{
              background: 'none',
              border: 'none',
              color: soundEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            title={soundEnabled ? 'Mute Spatial Audio' : 'Unmute Spatial Audio'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            SPATIAL AUDIO {soundEnabled ? 'ACTIVE' : 'MUTED'}
          </span>
        </div>

        {/* Live dynamic sound bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
          {waveHeights.map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: soundEnabled ? `${h}px` : '4px',
                background: soundEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
                borderRadius: '2px',
                transition: 'height 0.1s ease',
              }}
            />
          ))}
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
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
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
