'use client';

import React, { useState, useEffect } from 'react';

export interface VrDeviceLoaderProps {
  mode?: 'fullscreen' | 'card' | 'compact' | 'inline' | 'mini';
  theme?: 'auto' | 'dark' | 'light';
  title?: string;
  message?: string;
  subtext?: string;
  badge?: string;
  showCoordinates?: boolean;
  showBars?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function VrDeviceLoader({
  mode = 'card',
  theme = 'auto',
  title,
  message = 'INITIALIZING SPATIAL PIPELINE...',
  subtext = 'Synchronizing stereoscopic stream and tracking telemetry',
  badge = '6-DoF SPATIAL SYNC',
  showCoordinates = true,
  showBars = true,
  className = '',
  style,
}: VrDeviceLoaderProps) {
  const displayTitle = title || message;
  const themeClass = theme === 'light' ? 'vr-loader-light' : theme === 'dark' ? 'vr-loader-dark' : '';

  // Lightweight simulated spatial tracking coordinates
  const [coords, setCoords] = useState({ x: 0.02, y: -1.04, z: 0.85, rot: 14 });

  useEffect(() => {
    if (mode === 'mini' || mode === 'inline' || !showCoordinates) return;
    const interval = setInterval(() => {
      setCoords((prev) => ({
        x: Number((prev.x + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        y: Number((prev.y + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        z: Number((prev.z + (Math.random() * 0.04 - 0.02)).toFixed(2)),
        rot: Math.round((prev.rot + (Math.random() * 4 - 2)) % 360),
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, [mode, showCoordinates]);

  // Mini / Inline simplified rendition
  if (mode === 'mini') {
    return (
      <div className={`vr-stage-wrapper vr-stage-mini ${themeClass} ${className}`.trim()} style={style}>
        <div className="vr-headset-rig">
          <div className="vr-chassis-body">
            <div className="vr-lenses-container">
              <div className="vr-optical-lens">
                <div className="vr-lens-pupil" />
              </div>
              <div className="vr-optical-lens vr-optical-lens-right">
                <div className="vr-lens-pupil" />
              </div>
            </div>
            <div className="vr-scanner-beam" />
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'inline') {
    return (
      <div className={`vr-loader-inline ${themeClass} ${className}`.trim()} style={style}>
        <div className="vr-stage-wrapper vr-stage-mini" style={{ width: '28px', height: '28px', transform: 'scale(0.18)' }}>
          <div className="vr-headset-rig">
            <div className="vr-chassis-body">
              <div className="vr-lenses-container">
                <div className="vr-optical-lens">
                  <div className="vr-lens-pupil" />
                </div>
                <div className="vr-optical-lens vr-optical-lens-right">
                  <div className="vr-lens-pupil" />
                </div>
              </div>
              <div className="vr-scanner-beam" />
            </div>
          </div>
        </div>
        <span>{displayTitle}</span>
      </div>
    );
  }

  const isCompact = mode === 'compact';
  const containerClass =
    mode === 'fullscreen'
      ? 'vr-loader-overlay'
      : isCompact
      ? 'vr-loader-compact'
      : 'vr-loader-card';

  return (
    <div className={`${containerClass} ${themeClass} ${className}`.trim()} style={style} role="status" aria-live="polite">
      {/* 3D Perspective Wireframe Ambient Grid */}
      <div className="vr-spatial-grid-bg" aria-hidden="true" />

      {/* VR Headset Rig + Orbiting 6DoF Gyrorings */}
      <div className={`vr-stage-wrapper ${isCompact ? 'vr-stage-compact' : ''}`}>
        {/* Orbit Rings (Yaw, Pitch, Roll) */}
        <div className="vr-orbit-ring vr-orbit-ring-1" aria-hidden="true" />
        <div className="vr-orbit-ring vr-orbit-ring-2" aria-hidden="true" />
        <div className="vr-orbit-ring vr-orbit-ring-3" aria-hidden="true" />

        {/* Headset Assembly */}
        <div className="vr-headset-rig">
          {/* Side Straps */}
          <div className="vr-strap-left" />
          <div className="vr-strap-right" />

          {/* Visor Chassis Body */}
          <div className="vr-chassis-body">
            {/* Visor Glass Reflection */}
            <div className="vr-visor-glass">
              <div className="vr-glass-reflection" />
            </div>

            {/* Stereoscopic Dual Optical Fresnel Lenses */}
            <div className="vr-lenses-container">
              {/* Left Lens */}
              <div className="vr-optical-lens">
                <div className="vr-lens-crosshair-h" />
                <div className="vr-lens-crosshair-v" />
                <div className="vr-lens-pupil" />
              </div>

              {/* Right Lens */}
              <div className="vr-optical-lens vr-optical-lens-right">
                <div className="vr-lens-crosshair-h" />
                <div className="vr-lens-crosshair-v" />
                <div className="vr-lens-pupil" />
              </div>
            </div>

            {/* Vertical Laser Scanner Beam */}
            <div className="vr-scanner-beam" />

            {/* 4x Optical Tracking Camera Sensors (LiDAR) */}
            <div className="vr-sensor-dot vr-sensor-tl" />
            <div className="vr-sensor-dot vr-sensor-tr" />
            <div className="vr-sensor-dot vr-sensor-bl" />
            <div className="vr-sensor-dot vr-sensor-br" />

            {/* Front Edge Dynamic RGB Lightbar */}
            <div className="vr-status-lightbar" />
          </div>
        </div>
      </div>

      {/* Spatial Telemetry HUD & Status Readout */}
      <div className="vr-hud-telemetry">
        {badge && (
          <div className="vr-hud-badge">
            <span className="beacon-dot" style={{ width: '6px', height: '6px' }} />
            <span>{badge}</span>
          </div>
        )}

        <h4 className="vr-hud-title">{displayTitle}</h4>

        {subtext && <p className="vr-hud-subtitle">{subtext}</p>}

        {showBars && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div className="vr-hud-bars" aria-hidden="true">
              <div className="vr-hud-bar" />
              <div className="vr-hud-bar" />
              <div className="vr-hud-bar" />
              <div className="vr-hud-bar" />
              <div className="vr-hud-bar" />
            </div>
            <span className="vr-hud-status-text">
              120 FPS // STEREOSCOPIC BUFFER OK
            </span>
          </div>
        )}

        {showCoordinates && (
          <div className="vr-hud-coords">
            <div>
              XYZ [ <span>{coords.x >= 0 ? `+${coords.x}` : coords.x}</span>,{' '}
              <span>{coords.y >= 0 ? `+${coords.y}` : coords.y}</span>,{' '}
              <span>{coords.z >= 0 ? `+${coords.z}` : coords.z}</span> ]
            </div>
            <div>•</div>
            <div>
              YAW [ <span>{coords.rot}°</span> ]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
